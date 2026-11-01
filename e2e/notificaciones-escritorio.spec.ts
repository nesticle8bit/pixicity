import { CDPSession, expect, Page, test } from '@playwright/test';
import { simularApi } from './api-simulada';

/**
 * Notificaciones de escritorio (Web Push). Las pruebas no tienen servicio push real: `PushManager.subscribe` devuelve
 * una suscripción fija y el aviso se entrega al service worker por DevTools, como lo haría FCM.
 */

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const SESION = {
  usuario: { id: 'MQ==', userName: 'demo', rango: 'Usuario', avatar: '' },
  token: `Bearer ${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: 'demo', role: 'Usuario' })}.firma`,
  refreshToken: 'r',
};
// Claves válidas cualesquiera (RFC 8291, Apéndice A).
const CLAVE_SERVIDOR = 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8';
const P256DH = 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4';
const AUTH = 'BTBZMqHH6r4Tts7J_aSIgg';
const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/e2e-dispositivo';

type Pedido = { metodo: string; endpoint?: string | null; cuerpo?: Record<string, unknown> };

async function prepararPush(page: Page): Promise<Pedido[]> {
  const pedidos: Pedido[] = [];
  let guardada: Record<string, unknown> | null = null;

  await simularApi(page);
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(SESION));
  await page.addInitScript(
    ([endpoint, p256dh, auth]) => {
      // La suscripción sobrevive a las recargas, como la real (se guarda la clave con la que se creó).
      const CLAVE = 'e2e-push';
      const crear = (clave: number[]) => ({
        endpoint,
        options: { applicationServerKey: new Uint8Array(clave).buffer },
        toJSON: () => ({ endpoint, keys: { p256dh, auth } }),
        unsubscribe: async () => (sessionStorage.removeItem(CLAVE), true),
      });
      PushManager.prototype.getSubscription = async () => {
        const guardada = sessionStorage.getItem(CLAVE);
        return (guardada ? crear(JSON.parse(guardada)) : null) as PushSubscription | null;
      };
      PushManager.prototype.subscribe = async (opciones?: PushSubscriptionOptionsInit) => {
        const clave = [...(opciones?.applicationServerKey as Uint8Array)];
        sessionStorage.setItem(CLAVE, JSON.stringify(clave));
        return crear(clave) as unknown as PushSubscription;
      };
    },
    [ENDPOINT, P256DH, AUTH],
  );

  await page.route('**/api/notificaciones/preferencias', (r) => r.fulfill({ json: { status: 200, errors: [], data: [] } }));
  await page.route('**/api/push/clave', (r) => r.fulfill({ json: { status: 200, errors: [], data: { clavePublica: CLAVE_SERVIDOR } } }));
  await page.route('**/api/push/suscripcion**', (route) => {
    const req = route.request();
    const pedido: Pedido = { metodo: req.method(), endpoint: new URL(req.url()).searchParams.get('endpoint') };
    if (req.method() === 'PUT') {
      pedido.cuerpo = req.postDataJSON();
      guardada = pedido.cuerpo!;
    }
    if (req.method() === 'DELETE') guardada = null;
    pedidos.push(pedido);
    const data = req.method() === 'GET' ? guardada : true;
    return route.fulfill({ json: { status: 200, errors: [], data } });
  });
  return pedidos;
}

async function registroDelSw(cdp: CDPSession, origen: string): Promise<string> {
  const id = new Promise<string>((resolve) =>
    cdp.on('ServiceWorker.workerRegistrationUpdated', ({ registrations }) => {
      const r = registrations.find((x) => x.scopeURL.startsWith(origen) && !x.isDeleted);
      if (r) resolve(r.registrationId);
    }),
  );
  await cdp.send('ServiceWorker.enable');
  return id;
}

test('notificaciones de escritorio: se activan en /cuenta, se eligen por tipo y se desactivan', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'escritorio', 'mismo flujo en los dos; el celular solo cambia el lugar del aviso');
  await context.grantPermissions(['notifications']);
  const pedidos = await prepararPush(page);

  await page.goto('/cuenta?seccion=notificaciones');
  await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration())?.active, null, { timeout: 15_000 });
  await page.getByRole('button', { name: 'Activar en este dispositivo' }).click();

  await expect.poll(() => pedidos.find((p) => p.metodo === 'PUT')?.cuerpo).toEqual({
    endpoint: ENDPOINT, p256dh: P256DH, auth: AUTH, mensajes: true, notificaciones: true,
  });

  // Solo la campana: los mensajes privados dejan de avisarse en este dispositivo.
  await page.getByRole('switch', { name: 'Mensajes privados' }).click();
  await expect.poll(() => pedidos.filter((p) => p.metodo === 'PUT').at(-1)?.cuerpo?.['mensajes']).toBe(false);
  await expect(page.getByRole('switch', { name: 'Notificaciones', exact: true })).toBeChecked();

  // Prueba: el servidor la manda a este dispositivo y cuenta qué respondió el servicio push.
  let prueba: URL | undefined;
  await page.route('**/api/push/pruebas**', (r) => {
    prueba = new URL(r.request().url());
    return r.fulfill({ json: { status: 200, errors: [], data: { estado: 201, entregado: true, vencida: false } } });
  });
  await page.getByRole('button', { name: 'Enviar una notificación de prueba' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Enviada.' })).toBeVisible();
  expect(prueba?.searchParams.get('endpoint')).toBe(ENDPOINT);

  // Al volver a entrar se ve como quedó (lo trae del API por el endpoint de este navegador).
  await page.reload();
  await expect(page.getByRole('switch', { name: 'Mensajes privados' })).not.toBeChecked({ timeout: 15_000 });
  await expect(page.getByRole('switch', { name: 'Notificaciones', exact: true })).toBeChecked();

  await page.getByRole('button', { name: 'Desactivar en este dispositivo' }).click();
  await expect.poll(() => pedidos.find((p) => p.metodo === 'DELETE')?.endpoint).toBe(ENDPOINT);
  await expect(page.getByRole('button', { name: 'Activar en este dispositivo' })).toBeVisible();
});

test('notificaciones de escritorio: con el permiso bloqueado explica cómo volver a permitirlas', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio', 'mismo flujo en los dos');
  await prepararPush(page);
  await page.addInitScript(() => Object.defineProperty(Notification, 'permission', { get: () => 'denied' }));

  await page.goto('/cuenta?seccion=notificaciones');
  await expect(page.getByText('Las bloqueaste en este navegador')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Activar en este dispositivo' })).toHaveCount(0);
});

test('notificaciones de escritorio: el aviso se muestra con el sitio cerrado y se da de baja al cerrar sesión', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'escritorio', 'DevTools entrega el push igual en los dos');
  await context.grantPermissions(['notifications']);
  await prepararPush(page);
  const cdp = await context.newCDPSession(page);
  const registro = registroDelSw(cdp, baseURL!);

  await page.goto('/cuenta?seccion=notificaciones');
  await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration())?.active, null, { timeout: 15_000 });
  await page.getByRole('button', { name: 'Activar en este dispositivo' }).click();
  await expect(page.getByRole('switch', { name: 'Mensajes privados' })).toBeVisible();

  const registrationId = await registro;
  const origin = new URL(baseURL!).origin;
  const notificaciones = () => page.evaluate(async () => (await (await navigator.serviceWorker.ready).getNotifications()).length);

  // Con el sitio a la vista no se duplica: la campana y el chat ya lo muestran en vivo.
  await cdp.send('ServiceWorker.deliverPushMessage', { origin, registrationId, data: JSON.stringify({ titulo: 'x', tag: 'mon-1' }) });
  await page.waitForTimeout(1_000);
  expect(await notificaciones()).toBe(0);

  // La de prueba se muestra igual (forzar), para poder probar con el sitio abierto.
  await cdp.send('ServiceWorker.deliverPushMessage', { origin, registrationId, data: JSON.stringify({ titulo: '¡Funciona!', tag: 'prueba', forzar: true }) });
  await expect.poll(notificaciones).toBe(1);
  await page.evaluate(async () => (await (await navigator.serviceWorker.ready).getNotifications()).forEach((n) => n.close()));

  // Sin ninguna pestaña del sitio abierta: el service worker muestra el aviso con su enlace.
  await page.goto('about:blank');
  const aviso = { titulo: 'Mensaje de @beto', cuerpo: '¿Vas al asado?', url: '/mensajes/chat/beto', tag: 'mp-2' };
  await cdp.send('ServiceWorker.deliverPushMessage', { origin, registrationId, data: JSON.stringify(aviso) });

  await page.goto('/cuenta?seccion=notificaciones');
  await expect
    .poll(() =>
      page.evaluate(async () =>
        (await (await navigator.serviceWorker.ready).getNotifications()).map((n) => ({ titulo: n.title, cuerpo: n.body, tag: n.tag, url: n.data?.url, badge: n.badge })),
      ),
    )
    .toEqual([{ titulo: aviso.titulo, cuerpo: aviso.cuerpo, tag: aviso.tag, url: aviso.url, badge: expect.stringContaining('/assets/favicon/badge-96.png') }]);

  // Cerrar sesión: el API deja de avisar a este navegador (sin token y aunque la página se recargue enseguida).
  const delete$ = page.waitForRequest((r) => r.method() === 'DELETE' && r.url().includes('/api/push/suscripcion'));
  await page.locator('li.usernameMenu').hover();
  await page.getByRole('button', { name: 'Salir' }).click();
  const pedido = await delete$;
  expect(new URL(pedido.url()).searchParams.get('endpoint')).toBe(ENDPOINT);
  expect(pedido.headers()['authorization']).toBeUndefined();
});

import { expect, Page, test } from '@playwright/test';
import { AUTOR, POST, simularApi } from './api-simulada';

/** /monitor: búsqueda y filtros (dos columnas) contra un API simulado que registra lo que se le pide. */

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const JWT = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: 'demo' })}.firma`;
const SESION = { usuario: { id: 'MQ==', userName: 'demo', rango: 'Usuario', avatar: '' }, token: `Bearer ${JWT}`, refreshToken: 'r' };

const notificacion = (id: number, tipo: string, mensaje: string, leido: boolean) => ({
  id,
  fechaRegistro: new Date(Date.now() - id * 3600 * 1000).toISOString(),
  leido,
  eliminado: false,
  mensaje,
  postId: POST.id,
  comentarioId: tipo === 'Respuestas' ? 2 : null,
  tipoString: tipo,
  usuarioQueHaceAccion: { userName: AUTOR, avatar: null },
  post: { id: POST.id, titulo: POST.titulo, url: POST.url, categoria: POST.categoria },
});

async function abrirMonitor(page: Page): Promise<URL[]> {
  const pedidos: URL[] = [];
  await simularApi(page);
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(SESION));
  await page.route('**/api/monitors/getNotificaciones**', (route) => {
    pedidos.push(new URL(route.request().url()));
    return route.fulfill({
      json: {
        status: 200,
        errors: [],
        data: {
          data: [
            notificacion(1, 'Respuestas', 'Ha respondido a tu comentario', false),
            notificacion(2, 'Comentario', 'Comentó tu post', true),
          ],
          pagination: { totalCount: 2, pageSize: 10, currentPage: 1, totalPages: 1 },
        },
      },
    });
  });
  await page.goto('/monitor');
  await expect(page.locator('.mon-item')).toHaveCount(2);
  return pedidos;
}

test('lista con dos columnas y aplica búsqueda, estado, periodo y tipos', async ({ page }, info) => {
  const pedidos = await abrirMonitor(page);
  const ultimo = () => pedidos[pedidos.length - 1].searchParams;

  // Dos columnas en escritorio; en móvil se apilan.
  await expect(page.locator('.mon-toolbar')).toBeVisible();
  await expect(page.locator('.mon-grupo')).toHaveCount(5);
  await expect(page.locator('.mon-item--nueva')).toHaveCount(1);
  await page.screenshot({ path: info.outputPath('monitor.png'), fullPage: true });

  await page.getByLabel('Buscar notificaciones').fill('guia');
  await expect.poll(() => ultimo().get('q')).toBe('guia');

  await page.getByRole('button', { name: 'No leídas' }).click();
  await expect.poll(() => ultimo().get('soloNoLeidas')).toBe('true');

  await page.getByRole('button', { name: '7 días' }).click();
  await expect.poll(() => ultimo().get('periodo')).toBe('semana');

  // Quitar un tipo manda la lista explícita; sin "Respuestas".
  await page.locator('.mon-grupo', { hasText: 'Mis comentarios' }).getByLabel('Respuestas').uncheck();
  await expect.poll(() => ultimo().get('tipos') ?? '').not.toContain('Respuestas');
  expect(ultimo().get('tipos')).toContain('Comentario');

  // Ninguno: no se llama al API y se avisa.
  const antes = pedidos.length;
  await page.getByRole('button', { name: 'Ninguno' }).click();
  await expect(page.getByText('Marca al menos un tipo')).toBeVisible();
  expect(pedidos.length).toBe(antes);

  // Quitar filtros vuelve a pedir todo, sin parámetros de filtro.
  await page.getByRole('button', { name: 'Quitar filtros' }).click();
  await expect.poll(() => pedidos.length).toBeGreaterThan(antes);
  expect(ultimo().get('tipos')).toBeNull();
  expect(ultimo().get('q')).toBeNull();
  expect(ultimo().get('periodo')).toBeNull();
});

test('la respuesta enlaza al comentario', async ({ page }) => {
  await abrirMonitor(page);
  const enlace = page.locator('.mon-item').first().locator(`a[title="${POST.titulo}"]`);
  await expect(enlace).toHaveAttribute('href', /#comentario-2$/);
});

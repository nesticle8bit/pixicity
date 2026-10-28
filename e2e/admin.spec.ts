import { expect, Page, test } from '@playwright/test';
import { simularApi } from './api-simulada';

/** Panel de administración con el API simulado: usuarios (correo sin confirmar) y moderación (shouts denunciados). */

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const JWT = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: 'admin', role: 'Administrador' })}.firma`;
const SESION = { usuario: { id: 'MQ==', userName: 'admin', rango: 'Administrador', avatar: '' }, token: `Bearer ${JWT}`, refreshToken: 'r' };
const ok = (data: unknown) => ({ json: { status: 200, errors: [], data } });
const pagina = (lista: unknown[], clave = 'data') => ({ [clave]: lista, pagination: { totalCount: lista.length, pageSize: 25, currentPage: 1, totalPages: 1 } });

async function comoAdmin(page: Page): Promise<void> {
  await simularApi(page);
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(SESION));
}

test('usuarios: filtra por correo sin confirmar y lo confirma a mano', async ({ page }) => {
  await comoAdmin(page);
  const pedidosLista: URL[] = [];
  await page.route(/\/api\/usuarios\/admin/i, (r) => {
    pedidosLista.push(new URL(r.request().url()));
    return r.fulfill(ok(pagina([
      { id: 7, fechaRegistro: '2026-10-10T10:00:00Z', userName: 'nuevo', email: 'nuevo@correo.com', emailConfirmado: false, genero: null,
        puntos: 0, baneado: false, eliminado: false, avatar: null, cantidadPosts: 0, cantidadComentarios: 0, estado: null },
    ], 'usuarios')));
  });
  let confirmado = '';
  await page.route(/\/api\/usuarios\/\d+\/email\/confirmacion/i, (r) => {
    confirmado = /usuarios\/(\d+)\//.exec(r.request().url())?.[1] ?? '';
    return r.fulfill(ok(true));
  });
  await page.goto('/administracion/usuarios');
  const fila = page.getByRole('row', { name: /nuevo@correo\.com/ });
  await expect(fila.getByText('Sin confirmar')).toBeVisible();

  await fila.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('menuitem', { name: 'Marcar correo como confirmado' }).click();
  await page.getByRole('alertdialog', { name: 'Confirmar' }).getByRole('button', { name: 'Aceptar' }).click();
  await expect.poll(() => confirmado).toBe('7');
  await expect(fila.getByText('Sin confirmar')).toBeHidden();
});

test('moderación: un shout denunciado se muestra con su tipo y enlace, y se puede eliminar', async ({ page }) => {
  await comoAdmin(page);
  await page.route(/\/api\/moderacion\/reportes(\?|$)/i, (r) => r.fulfill(ok(pagina([
    { id: 3, tipoContenido: 6, tipoContenidoNombre: 'Shout', contenidoId: 44, motivo: 'Spam o publicidad', resuelto: false,
      resueltoPor: null, fechaResuelto: null, fechaRegistro: '2026-10-11T10:00:00Z', reportanteUserName: 'ana', reportanteAvatar: null,
      contenidoPreview: 'Compra seguidores baratos', autorUserName: 'spammer', autorAvatar: null, contenidoEliminado: false,
      contextoUrl: 'spammer' },
  ]))));
  await page.route(/\/api\/moderacion\/reglas/i, (r) => r.fulfill(ok([
    { id: 'spam', titulo: 'Spam o publicidad', descripcion: 'Publicidad no autorizada.' },
  ])));
  let eliminado = '';
  let regla = '';
  await page.route(/\/api\/moderacion\/reportes\/\d+\/contenido/i, (r) => {
    const url = new URL(r.request().url());
    eliminado = /reportes\/(\d+)\//.exec(url.pathname)?.[1] ?? '';
    regla = url.searchParams.get('regla') ?? '';
    return r.fulfill(ok(true));
  });

  await page.goto('/administracion/moderacion');
  const fila = page.getByRole('row', { name: /Compra seguidores baratos/ });
  await expect(fila.getByText('Shouts', { exact: true })).toBeVisible();
  await expect(fila.getByRole('link', { name: 'ver shout' })).toHaveAttribute('href', '/shouts/spammer/44');

  await fila.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('menuitem', { name: /Borrar contenido/ }).click();

  // Se elige la regla del protocolo que incumple: el autor la recibe en su aviso.
  const dialogo = page.getByRole('dialog', { name: 'Eliminar contenido' });
  await expect(dialogo.getByText('Denunciado por: Spam o publicidad')).toBeVisible();
  await dialogo.getByRole('radio', { name: /Spam o publicidad/ }).check();
  await dialogo.getByRole('button', { name: 'Eliminar' }).click();
  await expect.poll(() => eliminado).toBe('3');
  expect(regla).toBe('spam');
});

test('publicidad: crea un anuncio segmentado y lo lista con su estado y números', async ({ page }) => {
  await comoAdmin(page);
  const guardados: Record<string, unknown>[] = [];
  const lista: unknown[] = [];
  await page.route(/\/api\/anuncios\/admin\/opciones/i, (r) => r.fulfill(ok({
    ubicaciones: [{ id: 'post-abajo', nombre: 'Post: después del contenido' }, { id: 'portada-lateral', nombre: 'Portada: columna derecha' }],
    categorias: [{ id: '3', nombre: 'Juegos' }, { id: '4', nombre: 'Películas' }],
    comunidades: [{ id: '8', nombre: 'Linux' }],
  })));
  await page.route(/\/api\/anuncios\/admin(\?|$)/i, (r) => r.fulfill(ok(pagina(lista))));
  await page.route(/\/api\/anuncios$/i, (r) => {
    if (r.request().method() !== 'POST') return r.fulfill(ok([]));
    const cuerpo = r.request().postDataJSON();
    guardados.push(cuerpo);
    lista.push({ ...cuerpo, id: 1, fechaRegistro: '2026-10-25T10:00:00Z', impresiones30Dias: 200, clics30Dias: 5 });
    return r.fulfill(ok(1));
  });
  await page.route(/\/api\/configuracion(\?|$)/i, (r) => r.fulfill(ok({ headerScript: '', footerScript: '' })));

  await page.goto('/administracion/publicidad');
  await page.getByRole('button', { name: 'Nuevo anuncio' }).click();

  const dialogo = page.getByRole('dialog');
  await dialogo.getByLabel('Nombre').fill('Campaña juegos');
  await dialogo.getByLabel('Tipo').selectOption('imagen');
  await dialogo.getByLabel('URL de la imagen').fill('https://cdn.ejemplo.com/banner.png');
  await dialogo.getByLabel('Enlace al hacer clic').fill('https://ejemplo.com');
  await expect(dialogo.getByText('Elige al menos una ubicación')).toBeVisible();
  await dialogo.getByLabel('Post: después del contenido').check();
  await dialogo.getByLabel('Juegos').check();
  await dialogo.getByLabel('Dispositivo').selectOption('movil');
  await dialogo.getByRole('button', { name: 'Crear' }).click();

  await expect.poll(() => guardados.length).toBe(1);
  // El formulario manda más campos (vacíos): se comparan los que importan.
  expect(guardados[0]).toMatchObject({
    nombre: 'Campaña juegos', tipo: 'imagen', imagenUrl: 'https://cdn.ejemplo.com/banner.png', ubicaciones: ['post-abajo'],
    categoriaIds: [3], comunidadIds: [], dispositivo: 'movil', audiencia: 'todos', activo: true, peso: 1,
  });

  const fila = page.getByRole('row', { name: /Campaña juegos/ });
  await expect(fila.getByText('Activo')).toBeVisible();
  await expect(fila.getByText('2.5%')).toBeVisible(); // 5 clics / 200 impresiones
});

import { expect, Page, test } from '@playwright/test';
import { POST, simularApi } from './api-simulada';

/**
 * Flujos críticos de punta a punta (con el API simulado): iniciar sesión, publicar un post, comentar y moderar.
 * Verifican lo que la app le manda al API, no solo lo que muestra.
 */

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (userName: string, rol = 'Usuario') => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: userName, role: rol })}.firma`;
const sesion = (userName: string, rango = 'Usuario') => ({
  usuario: { id: 'MQ==', userName, rango, avatar: '' },
  token: `Bearer ${jwt(userName, rango)}`,
  refreshToken: 'r',
});
const ok = (data: unknown) => ({ json: { status: 200, errors: [], data } });

async function conSesion(page: Page, userName: string, rango = 'Usuario'): Promise<void> {
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(sesion(userName, rango)));
}

test.beforeEach(async ({ page }) => {
  await simularApi(page);
});

test.describe('iniciar sesión', () => {
  test('con credenciales correctas guarda la sesión y entra', async ({ page }) => {
    let enviado: unknown;
    await page.route('**/api/usuarios/login', (route) => {
      enviado = route.request().postDataJSON();
      return route.fulfill(ok(sesion('demo')));
    });

    await page.goto('/login');
    await page.getByLabel('Nombre de Usuario').fill('demo');
    await page.getByLabel('Contraseña').fill('secreto123');
    await page.locator('input.submit-btn').click();

    // Tras el login la app recarga en la portada.
    await page.waitForURL((url) => !url.pathname.startsWith('/login'));
    await page.waitForLoadState('domcontentloaded');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taringas') || '{}').usuario?.userName)).toBe('demo');
    expect(enviado).toEqual(jasmineLike({ userName: 'demo', password: 'secreto123' }));
  });

  test('con credenciales incorrectas muestra el error y no guarda nada', async ({ page }) => {
    await page.route('**/api/usuarios/login', (route) => route.fulfill(ok('error')));

    await page.goto('/login');
    await page.getByLabel('Nombre de Usuario').fill('demo');
    await page.getByLabel('Contraseña').fill('mala');
    await page.locator('input.submit-btn').click();

    await expect(page.getByText('Las credenciales son incorrectas', { exact: false })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('taringas'))).toBeNull();
  });
});

test('publicar un post envía título, categoría, contenido y etiquetas', async ({ page }) => {
  await conSesion(page, 'demo');
  await page.route('**/api/categorias/getCategoriasDropdown**', (r) => r.fulfill(ok([{ id: 1, nombre: 'Info' }, { id: 2, nombre: 'Juegos' }])));
  let publicado: Record<string, unknown> | undefined;
  await page.route('**/api/posts/savePost', (route) => {
    publicado = route.request().postDataJSON();
    return route.fulfill(ok(99));
  });

  await page.goto('/crear/post');
  await page.locator('.cp-title__input').fill('Mi guía de prueba');
  await page.locator('app-select[formcontrolname="categoriaId"] .asel').click();
  await page.locator('.asel__option', { hasText: 'Juegos' }).click();
  await page.locator('.rich-editor__content').click();
  await page.keyboard.type('Contenido escrito en el editor.');
  await page.getByPlaceholder('Agregar y Enter…').fill('pruebas');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Publicar' }).click();

  await expect.poll(() => publicado).toBeTruthy();
  expect(publicado!['titulo']).toBe('Mi guía de prueba');
  expect(publicado!['categoriaId']).toBe(2);
  // Además de la escrita, la app sugiere etiquetas a partir del título.
  expect(String(publicado!['etiquetas']).split(',')).toContain('pruebas');
  expect(publicado!['esBorrador']).toBe(false);
  expect(String(publicado!['contenido'])).toContain('Contenido escrito en el editor.');
  await expect(page).toHaveURL(/\/$/);
});

test('comentar un post lo envía al API y lo muestra en la lista', async ({ page }) => {
  await conSesion(page, 'lector_tres');
  let comentario: Record<string, unknown> | undefined;
  await page.route('**/api/comentarios/addComentario', (route) => {
    comentario = route.request().postDataJSON();
    return route.fulfill(ok(77));
  });

  await page.goto(`/posts/${POST.categoria.seo}/${POST.id}/${POST.url}`);
  await page.getByLabel('Escribe un comentario').fill('¡Excelente aporte, gracias!');
  await page.getByRole('button', { name: 'Comentar' }).click();

  await expect(page.locator('#comentario-77')).toContainText('¡Excelente aporte, gracias!');
  expect(comentario).toEqual(jasmineLike({ postId: POST.id, contenido: '¡Excelente aporte, gracias!' }));
});

test('moderar: marcar un reporte como resuelto', async ({ page }) => {
  await conSesion(page, 'admin', 'Administrador');
  await page.route('**/api/moderacion/getReportes**', (r) =>
    r.fulfill(
      ok({
        data: [
          {
            id: 5, tipoContenido: 1, tipoContenidoNombre: 'Post', contenidoId: POST.id, motivo: 'Spam', resuelto: false,
            resueltoPor: null, fechaResuelto: null, fechaRegistro: new Date().toISOString(), reportanteUserName: 'lector_uno',
            reportanteAvatar: null, contenidoPreview: 'Post de spam', autorUserName: 'spammer', autorAvatar: null,
            contenidoEliminado: false, contextoUrl: null,
          },
        ],
        pagination: { totalCount: 1, pageSize: 25, currentPage: 1, totalPages: 1 },
        pendientes: 1,
      })
    )
  );
  const resueltos: string[] = [];
  await page.route('**/api/moderacion/resolverReporte**', (route) => {
    resueltos.push(new URL(route.request().url()).searchParams.get('reporteId') ?? '');
    return route.fulfill(ok(true));
  });

  await page.goto('/administracion/moderacion');
  await expect(page.getByText('Post de spam')).toBeVisible();
  await expect(page.getByText('Pendiente', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('menuitem', { name: 'Marcar resuelto' }).click();

  await expect(page.getByText('Resuelto', { exact: true })).toBeVisible();
  expect(resueltos).toEqual(['5']);
});

/** Coincidencia parcial de objetos (las peticiones pueden traer más campos). */
function jasmineLike(parcial: Record<string, unknown>) {
  return expect.objectContaining(parcial);
}

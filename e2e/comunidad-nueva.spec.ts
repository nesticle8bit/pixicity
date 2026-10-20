import { expect, Page, Route, test } from '@playwright/test';
import { simularApi } from './api-simulada';

/**
 * Flujos de la tanda "comunidad" (oct 2026): /mi público, hashtags (enlaces, página propia, autocompletado del
 * buscador y del composer), login que vuelve a donde estaba y la bienvenida guiada. El API se simula.
 */

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const JWT = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: 'demo' })}.firma`;
const SESION = { usuario: { id: 'MQ==', userName: 'demo', rango: 'Usuario', avatar: '' }, token: `Bearer ${JWT}`, refreshToken: 'r' };

const AHORA = new Date().toISOString();

const shout = (id: number, comentario: string) => ({
  id,
  perfilId: 2,
  usuarioId: 2,
  comentario,
  url: '',
  tipo: 'Texto',
  mediaTitulo: null,
  mediaImagen: null,
  mediaDescripcion: null,
  avatar: { userName: 'ana', avatar: null },
  perfil: { userName: 'ana', avatar: null },
  interacciones: { meGustas: 3, favoritos: 0, meGusta: false, favorito: false, comentarios: 1, reshouts: 0, reshouteado: false },
  fechaRegistro: AHORA,
  fechaActualiza: null,
});

const ok = (route: Route, data: unknown) => route.fulfill({ json: { status: 200, errors: [], data } });

/** API de /mi y de hashtags; devuelve las URLs pedidas a getMuro para poder revisar los parámetros. */
async function simularMi(page: Page): Promise<URL[]> {
  const muro: URL[] = [];
  await simularApi(page);
  await page.route('**/api/mi/muro**', (route) => {
    const url = new URL(route.request().url());
    muro.push(url);
    const tag = url.searchParams.get('tag');
    return ok(route, {
      items: [{ tipo: 'shout', fecha: AHORA, shout: shout(1, tag ? `Escuchando #${tag} hoy` : 'Hola a todos, escuchando #rock') }],
      siguiente: null,
    });
  });
  await page.route('**/api/mi/tendencias**', (route) => {
    const recientes = new URL(route.request().url()).searchParams.get('orden') === 'recientes';
    return ok(route, recientes ? [{ tag: 'jazz', shouts: 1, ultimo: AHORA }] : [{ tag: 'rock', shouts: 12, ultimo: AHORA }]);
  });
  await page.route('**/api/mi/sugerencias**', (route) => ok(route, [{ userName: 'ana', avatar: null, seguidores: 4 }]));
  await page.route('**/api/mi/resumen**', (route) =>
    ok(route, { id: 1, userName: 'demo', avatar: null, rango: 'Novato', puntos: 0, seguidores: 0, siguiendo: 0, shouts: 0, posts: 0 }),
  );
  await page.route('**/api/mi/hashtags**', (route) =>
    ok(route, [
      { tag: 'rock', shouts: 12, ultimo: AHORA },
      { tag: 'rocknacional', shouts: 3, ultimo: AHORA },
    ]),
  );
  await page.route('**/api/usuarios/menciones**', (route) => ok(route, [{ id: 2, userName: 'ana', avatar: null }]));
  return muro;
}

test('/mi sin cuenta: muestra Novedades, invita a registrarse y un "me gusta" lleva al login', async ({ page }) => {
  const muro = await simularMi(page);
  await page.goto('/mi');

  await expect(page.getByRole('heading', { name: 'Shouts', level: 1 })).toBeVisible();
  await expect(page.getByText('Únete a la conversación.')).toBeVisible();
  await expect(page.locator('app-shout-card')).toHaveCount(1);
  expect(muro[0].searchParams.get('alcance')).toBe('todos');

  await page.locator('app-shout-card').getByRole('button', { name: /me gusta/i }).first().click();
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fmi/);
});

test('un #hashtag del shout abre su página propia /hashtag/:tag con el muro filtrado', async ({ page }) => {
  const muro = await simularMi(page);
  await page.goto('/mi');

  await page.locator('app-shout-card').getByRole('link', { name: '#rock' }).click();
  await expect(page).toHaveURL(/\/hashtag\/rock$/);
  await expect(page.getByRole('heading', { name: '#rock', level: 1 })).toBeVisible();
  await expect.poll(() => muro[muro.length - 1].searchParams.get('tag')).toBe('rock');
});

test('el lateral de /mi tiene hashtags Mejores y Recientes', async ({ page, isMobile }) => {
  test.skip(isMobile, 'en móvil el lateral se muestra arriba del muro (mismo componente)');
  await simularMi(page);
  await page.goto('/mi');

  const lateral = page.locator('aside.mi-lateral');
  await expect(lateral.getByRole('link', { name: /#rock/ })).toBeVisible();
  await lateral.getByRole('tab', { name: 'Recientes' }).click();
  await expect(lateral.getByRole('link', { name: /#jazz/ })).toBeVisible();
});

test('el buscador sugiere #hashtags y @usuarios y lleva directo a su página', async ({ page }) => {
  await simularMi(page);
  await page.goto('/buscar');

  const caja = page.getByLabel('Texto a buscar');
  await caja.fill('#ro');
  await expect(page.getByRole('option', { name: /#rocknacional/ })).toBeVisible();
  await caja.press('Enter');
  await expect(page).toHaveURL(/\/hashtag\/rock$/);

  await page.goto('/buscar');
  await page.getByLabel('Texto a buscar').fill('@an');
  await expect(page.getByRole('option', { name: /@ana/ })).toBeVisible();
  await page.getByRole('option', { name: /@ana/ }).click();
  await expect(page).toHaveURL(/\/perfil\/ana$/);
});

test('el composer de /mi autocompleta #hashtags con el teclado', async ({ page }) => {
  await simularMi(page);
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(SESION));
  await page.goto('/mi');

  const campo = page.getByRole('combobox', { name: '¿Qué estás pensando?' });
  await campo.fill('Me encanta el #ro');
  await expect(page.getByRole('option', { name: /#rocknacional/ })).toBeVisible();
  await campo.press('ArrowDown');
  await campo.press('Enter');
  await expect(campo).toHaveValue('Me encanta el #rocknacional ');
});

test('el login vuelve a la página pedida (returnUrl)', async ({ page }) => {
  await simularApi(page);
  await page.route('**/api/auth/login', (route) => ok(route, SESION));
  await page.route('**/api/mi/**', (route) => ok(route, []));
  await page.route('**/api/comunidades/**', (route) => ok(route, []));
  await page.goto('/login?returnUrl=%2Fbienvenida');

  await page.locator('#nickname').fill('demo');
  await page.locator('#password').fill('secreto');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).or(page.locator('input[type=submit]')).first().click();
  await expect(page).toHaveURL(/\/bienvenida$/);
});

test('bienvenida guiada: unirse a comunidades, seguir gente y terminar en /mi', async ({ page }) => {
  await simularMi(page);
  const acciones: string[] = [];
  await page.route('**/api/comunidades/top**', (route) =>
    ok(route, [
      { id: 3, nombre: 'Comunidad Demo', nombreCorto: 'demo', descripcion: null, imagen: null, categoria: 'Varios', creador: 'ana', miembrosCount: 10, temasCount: 4, fechaRegistro: AHORA },
    ]),
  );
  await page.route('**/api/comunidades/*/membresia', (route) => {
    acciones.push('unirme');
    return ok(route, true);
  });
  await page.route('**/api/usuarios/seguimientos', (route) => {
    acciones.push('seguir');
    return ok(route, true);
  });
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(SESION));
  await page.goto('/bienvenida');

  await expect(page.getByRole('heading', { name: 'Armemos tu muro' })).toBeVisible();
  await page.getByRole('button', { name: 'Unirme a Comunidad Demo' }).click();
  await expect(page.getByRole('button', { name: 'Salir de Comunidad Demo' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Seguir a ana' }).click();
  await expect(page.getByRole('button', { name: 'Dejar de seguir a ana' })).toBeVisible();

  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByRole('heading', { name: 'Preséntate con tu primer shout' })).toBeVisible();
  await page.getByRole('button', { name: 'Ir a mi muro' }).click();
  await expect(page).toHaveURL(/\/mi$/);
  expect(acciones).toEqual(['unirme', 'seguir']);
});

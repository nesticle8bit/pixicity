import { expect, test } from '@playwright/test';
import { AUTOR, simularApi } from './api-simulada';

/** Línea de tiempo del perfil: todo lo que hizo el usuario mezclado por fecha, con scroll infinito y filtros. */

const ok = (data: unknown) => ({ json: { status: 200, errors: [], data } });
const yo = { userName: AUTOR, avatar: null };
const hace = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString();

const shout = (id: number, comentario: string, minutos: number) => ({
  tipo: 'shout', clave: `shout-${id}`, fecha: hace(minutos), compartidoPor: null, post: null, actividad: null,
  shout: {
    id, perfilId: 5, usuarioId: 5, comentario, url: '', tipo: 'Texto', mediaTitulo: null, mediaImagen: null, mediaDescripcion: null,
    fijado: false, avatar: yo, perfil: yo, fechaRegistro: hace(minutos),
  },
});
const actividad = (clave: string, minutos: number, datos: Record<string, unknown>) => ({
  tipo: 'actividad', clave, fecha: hace(minutos), shout: null, compartidoPor: null, post: null,
  actividad: { id: 1, fechaRegistro: hace(minutos), tipoActividad: 11, tipo: 'shout', accion: 'Le gustó un shout de', titulo: 'beto', url: '/shouts/beto/9', ...datos },
});

const PAGINA_1 = {
  fijado: null,
  siguiente: hace(60),
  items: [
    shout(1, 'Mi último shout', 1),
    actividad('cp-7', 2, { tipo: 'comentario', tipoActividad: 5, accion: 'Comentó el post', titulo: 'Guía de Angular', url: '/posts/info/3/guia-de-angular#comentario-7', extracto: '¡Excelente guía!' }),
    actividad('a-1', 3, {}), actividad('a-2', 4, {}), actividad('a-3', 5, {}), actividad('a-4', 6, {}), actividad('a-5', 7, {}),
    {
      tipo: 'post', clave: 'post-3', fecha: hace(60), shout: null, compartidoPor: null, actividad: null,
      post: { id: 3, titulo: 'Mi post nuevo', url: 'mi-post-nuevo', puntos: 10, comentarios: 2, autor: yo, categoriaNombre: 'Info', categoriaIcono: 'info.png', categoriaSeo: 'info' },
    },
  ],
};
const PAGINA_2 = {
  fijado: null,
  siguiente: null,
  items: [actividad('a-9', 60 * 24 * 3, { tipoActividad: 15, tipo: 'comunidad', accion: 'Se unió a la comunidad', titulo: 'Gamers', url: '/comunidades/gamers' })],
};

test('perfil: la línea de tiempo mezcla todo, pliega las reacciones y carga más al bajar', async ({ page }, info) => {
  await simularApi(page);
  await page.route(/\/api\/usuarios\/por-nombre\/[^/?]+(\?|$)/, (r) =>
    r.fulfill(ok({ id: 5, userName: AUTOR, avatar: null, profileBackground: '', rango: null, pais: null, postsCount: 1, seguidoresCount: 0 })));
  const pedidos: URL[] = [];
  await page.route(/\/api\/usuarios\/\d+\/muro/, (r) => {
    const url = new URL(r.request().url());
    pedidos.push(url);
    return r.fulfill(ok(url.searchParams.get('antes') ? PAGINA_2 : PAGINA_1));
  });

  await page.goto(`/perfil/${AUTOR}`);
  const linea = page.getByRole('list', { name: `Actividad de ${AUTOR}` });
  await expect(linea.locator('app-shout-card', { hasText: 'Mi último shout' })).toBeVisible();
  await expect(linea.getByRole('heading', { name: 'Hoy' })).toBeVisible();

  // El comentario muestra su texto y lleva al comentario.
  const cita = linea.getByRole('link', { name: '¡Excelente guía!' });
  await expect(cita).toHaveAttribute('href', '/posts/info/3/guia-de-angular#comentario-7');
  await expect(linea.locator('app-post-card', { hasText: 'Mi post nuevo' })).toBeVisible();

  // Cinco "me gusta" seguidos: se ven dos y el resto se despliega.
  await expect(linea.getByText('Le gustó un shout de')).toHaveCount(2);
  await linea.getByRole('button', { name: 'Ver 3 actividades más' }).click();
  await expect(linea.getByText('Le gustó un shout de')).toHaveCount(5);

  // Scroll infinito: al llegar al final pide la página siguiente con el cursor.
  await page.locator('.tl-centinela').scrollIntoViewIfNeeded();
  await expect(linea.getByRole('link', { name: 'Gamers' })).toBeVisible();
  expect(pedidos.at(-1)?.searchParams.get('antes')).toBe(PAGINA_1.siguiente);
  await expect(page.getByText('Eso es todo.')).toBeVisible();

  // Filtros: vuelve a pedir desde arriba con el filtro.
  const filtros = page.getByRole('group', { name: 'Qué mostrar en la línea de tiempo' });
  await filtros.getByRole('button', { name: 'Comentarios' }).click();
  await expect.poll(() => pedidos.at(-1)?.searchParams.get('filtro')).toBe('comentarios');
  expect(pedidos.at(-1)?.searchParams.get('antes')).toBeNull();
  await expect(filtros.getByRole('button', { name: 'Comentarios' })).toHaveAttribute('aria-pressed', 'true');

  if (info.project.name === 'movil') {
    // En el celular nada se sale de la pantalla (los filtros se deslizan dentro de su fila).
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(desborde).toBeLessThanOrEqual(0);
  }
});

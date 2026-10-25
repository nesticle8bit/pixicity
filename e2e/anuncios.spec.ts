import { expect, Page, test } from '@playwright/test';
import { POST, simularApi } from './api-simulada';

/** Anuncios segmentados: cuál sale en cada espacio del post, el del medio del contenido y las métricas. */

const RUTA_POST = `/posts/${POST.categoria.seo}/${POST.id}/${POST.url}`;

const anuncio = (id: number, ubicaciones: string[], extra: Record<string, unknown> = {}) => ({
  id,
  tipo: 'imagen',
  imagenUrl: '/assets/images/avatar.png',
  enlaceUrl: 'https://ejemplo.com/promo',
  textoAlternativo: `Anuncio ${id}`,
  ancho: 300,
  alto: 250,
  ubicaciones,
  categoriaIds: [],
  categoriaSeos: [],
  comunidadIds: [],
  dispositivo: 'todos',
  audiencia: 'todos',
  peso: 1,
  ...extra,
});

async function conAnuncios(page: Page, anuncios: unknown[], contenido = POST.contenido): Promise<{ impresiones: number; clics: number }[]> {
  await simularApi(page);
  await page.route(/\/api\/anuncios(\?|$)/i, (r) => r.fulfill({ json: { status: 200, errors: [], data: anuncios } }));
  await page.route(/\/api\/posts\/\d+(\?|$)/i, (r) => r.fulfill({ json: { status: 200, errors: [], data: { post: { ...POST, contenido } } } }));
  const metricas: { impresiones: number; clics: number }[] = [];
  await page.route(/\/api\/anuncios\/metricas/i, (r) => {
    metricas.push(...(r.request().postDataJSON().eventos ?? []));
    return r.fulfill({ json: { status: 200, errors: [], data: 1 } });
  });
  return metricas;
}

test('cada espacio muestra el anuncio que le corresponde a la categoría y al dispositivo', async ({ page, isMobile }) => {
  await conAnuncios(page, [
    anuncio(1, ['post-abajo'], { categoriaIds: [POST.categoria.id], categoriaSeos: [POST.categoria.seo] }),
    anuncio(2, ['post-abajo'], { categoriaIds: [999], categoriaSeos: ['otra'] }), // otra categoría: nunca
    anuncio(3, ['post-arriba'], { dispositivo: 'movil' }),
    anuncio(4, ['post-arriba'], { dispositivo: 'escritorio' }),
    anuncio(5, ['post-lateral'], { audiencia: 'registrados' }), // sin sesión: no sale
  ]);

  await page.goto(RUTA_POST);

  await expect(page.locator('app-anuncio[ubicacion="post-abajo"] img')).toHaveAttribute('alt', 'Anuncio 1');
  await expect(page.locator('app-anuncio[ubicacion="post-arriba"] img')).toHaveAttribute('alt', isMobile ? 'Anuncio 3' : 'Anuncio 4');
  await expect(page.locator('app-anuncio[ubicacion="post-lateral"]')).toBeHidden();
  await expect(page.locator('app-anuncio[ubicacion="post-abajo"] a')).toHaveAttribute('rel', 'sponsored noopener');
});

test('el anuncio "post-medio" va después del tercer párrafo y no toca el índice', async ({ page }) => {
  const parrafos = Array.from({ length: 6 }, (_, i) => `<p>Párrafo ${i + 1}</p>`);
  const contenido = parrafos.slice(0, 3).join('') + '<h2>Instalación</h2>' + parrafos.slice(3).join('');
  await conAnuncios(page, [anuncio(7, ['post-medio'])], contenido);

  await page.goto(RUTA_POST);

  const medio = page.locator('.contenido app-anuncio[ubicacion="post-medio"]');
  await expect(medio.locator('img')).toHaveAttribute('alt', 'Anuncio 7');
  // Lo que queda justo antes del anuncio es el tercer párrafo; después sigue el título.
  const vecinos = await medio.evaluate((el) => ({
    antes: el.previousElementSibling?.lastElementChild?.textContent,
    despues: el.nextElementSibling?.firstElementChild?.textContent,
  }));
  expect(vecinos).toEqual({ antes: 'Párrafo 3', despues: 'Instalación' });
  // La directiva del contenido igual procesa los títulos de las dos partes (los ids del índice).
  await expect(page.locator('.contenido h2')).toHaveAttribute('id', 't-instalacion');
});

test('cuenta la impresión al verse y el clic en su enlace, y los manda juntos', async ({ page }) => {
  await page.clock.install();
  const metricas = await conAnuncios(page, [anuncio(9, ['post-arriba'])]);

  await page.goto(RUTA_POST);
  const espacio = page.locator('app-anuncio[ubicacion="post-arriba"]');
  await expect(espacio.locator('img')).toBeVisible();

  await page.clock.runFor(1500); // visto más de 1 s
  const pestana = page.waitForEvent('popup');
  await espacio.locator('a').click();
  await (await pestana).close();
  await page.clock.runFor(16_000); // el envío en lote sale cada 15 s

  await expect.poll(() => metricas).toEqual([{ anuncioId: 9, impresiones: 1, clics: 1 }]);
});

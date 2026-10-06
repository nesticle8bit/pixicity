import { expect, Page, test } from '@playwright/test';
import { simularApi } from './api-simulada';

/** Buscador: inicio, resultados, filtros en la URL y textos con caracteres especiales. */

const CATEGORIAS = [
  { id: 1, nombre: 'E-books y Tutoriales', seo: 'ebooks-tutoriales', icono: 'ebooks.png', total: 3 },
  { id: 2, nombre: 'Info', seo: 'info', icono: 'info.png', total: 1 },
];

const resultado = (id: number, titulo: string, extracto: string, etiquetas: string[]) => ({
  id,
  titulo,
  url: titulo.toLowerCase().replace(/ /g, '-'),
  extracto,
  etiquetas,
  fechaRegistro: new Date(Date.now() - id * 86400000).toISOString(),
  puntos: 10 * id,
  comentarios: id,
  favoritos: 2,
  visitantes: 150,
  esPrivado: id === 3,
  sticky: false,
  categoria: CATEGORIAS[0],
  autor: 'dorantesm',
  autorAvatar: null,
});

async function simularBusqueda(page: Page): Promise<URL[]> {
  const pedidos: URL[] = [];
  await simularApi(page);
  await page.route('**/api/categorias/getTopCategorias**', (route) =>
    route.fulfill({
      json: {
        status: 200,
        errors: [],
        data: CATEGORIAS.map((c) => ({ id: c.id, nombre: c.nombre, seo: c.seo, icono: c.icono, totalPosts: 40 })),
      },
    })
  );
  await page.route('**/api/busqueda/posts**', (route) => {
    const url = new URL(route.request().url());
    pedidos.push(url);
    const q = url.searchParams.get('q') ?? '';
    const vacio = q.includes('nada');
    return route.fulfill({
      json: {
        status: 200,
        errors: [],
        data: {
          data: vacio
            ? []
            : [
                resultado(1, 'Carretera maldita — Stephen King (1981)', '…una novela de Stephen King sobre la pérdida…', ['stephen king', 'novela']),
                resultado(2, 'Los langoliers — Stephen King (1990)', 'Relato de terror <script>alert(1)</script>', ['terror']),
                resultado(3, 'Ventana secreta (1990) Stephen King', '', []),
              ],
          categorias: vacio ? [] : CATEGORIAS,
          terminos: q.toLowerCase().split(/\s+/).filter((t) => t.length > 1),
          pagination: { totalCount: vacio ? 0 : 23, pageSize: 10, currentPage: 1, totalPages: vacio ? 0 : 3 },
        },
      },
    });
  });
  return pedidos;
}

test('inicio: buscar navega a la URL de resultados y guarda la búsqueda reciente', async ({ page }, info) => {
  await simularBusqueda(page);
  await page.goto('/buscar');
  await expect(page.getByRole('heading', { name: '¿Qué estás buscando?' })).toBeVisible();
  await expect(page.locator('.bq-cat')).toHaveCount(2);
  await page.screenshot({ path: info.outputPath('buscar-inicio.png'), fullPage: true });

  await page.getByRole('radio', { name: 'Título' }).click();
  await page.getByLabel('Texto a buscar').fill('stephen king');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page).toHaveURL(/\/buscar\/posts\/stephen%20king\?en=titulo$/);
  await expect(page.locator('.bq-res')).toHaveCount(3);

  await page.goto('/buscar');
  await expect(page.locator('.bq-chip a', { hasText: 'stephen king' })).toBeVisible();
});

test('resultados: resalta, filtra por la URL y no ejecuta HTML del extracto', async ({ page }, info) => {
  const pedidos = await simularBusqueda(page);
  const ultimo = () => pedidos[pedidos.length - 1].searchParams;
  let alerta = false;
  page.on('dialog', (d) => {
    alerta = true;
    return d.dismiss();
  });

  await page.goto('/buscar/posts/stephen');
  await expect(page.locator('.bq-res')).toHaveCount(3);
  await expect(page.locator('.bq-resumen__texto')).toContainText('23 resultados');
  await expect(page.locator('.bq-res__titulo mark').first()).toHaveText(/stephen/i);
  await expect(page.locator('.bq-res__privado')).toHaveCount(1);
  await expect(page.locator('.bq-res__extracto').nth(1)).toContainText('<script>'); // como texto, no como HTML
  await page.screenshot({ path: info.outputPath('buscar-resultados.png'), fullPage: true });

  // En móvil los filtros arrancan plegados (y se vuelven a plegar al cambiar de categoría, que cambia la ruta).
  const abrirFiltros = async () => {
    const plegable = page.locator('.bq-plegable__boton');
    if ((await plegable.isVisible()) && !(await page.locator('.bq-plegable').evaluate((d) => (d as HTMLDetailsElement).open))) {
      await plegable.click();
    }
  };
  await abrirFiltros();
  await page.locator('.bq-facetas button', { hasText: 'E-books' }).click();
  await expect(page).toHaveURL(/\/buscar\/posts\/stephen\/ebooks-tutoriales$/);
  await expect.poll(() => ultimo().get('categoria')).toBe('ebooks-tutoriales');

  await page.getByLabel('Ordenar por').selectOption('puntos');
  await expect.poll(() => ultimo().get('orden')).toBe('puntos');

  await abrirFiltros();
  await page.getByRole('radio', { name: 'Último mes' }).click();
  await expect.poll(() => ultimo().get('periodo')).toBe('mes');

  await abrirFiltros();
  await page.getByLabel('Filtrar por autor').fill('Dorantes');
  await expect.poll(() => ultimo().get('autor')).toBe('Dorantes');
  await expect(page).toHaveURL(/autor=Dorantes/);

  await page.getByRole('button', { name: 'Quitar todo' }).click();
  await expect.poll(() => ultimo().get('categoria')).toBeNull();
  expect(ultimo().get('autor')).toBeNull();
  expect(ultimo().get('periodo')).toBeNull();
  expect(ultimo().get('orden')).toBe('puntos'); // el orden no es un filtro
  expect(alerta).toBe(false);
});

test('texto con "/", "&" y "#" llega completo al API', async ({ page }) => {
  const pedidos = await simularBusqueda(page);
  await page.goto('/buscar');
  await page.getByLabel('Texto a buscar').fill('AC/DC & co #1');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect.poll(() => pedidos[pedidos.length - 1]?.searchParams.get('q')).toBe('AC/DC & co #1');
  await expect(page.locator('.bq-resumen__texto')).toContainText('AC/DC & co #1');
});

test('sin resultados muestra sugerencias', async ({ page }) => {
  await simularBusqueda(page);
  await page.goto('/buscar/posts/nada que ver?en=titulo');
  await expect(page.getByRole('heading', { name: 'Nada por aquí' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Quitar los filtros' })).toBeVisible();
});

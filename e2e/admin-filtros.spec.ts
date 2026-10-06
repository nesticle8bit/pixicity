import { expect, Page, test } from '@playwright/test';
import { simularApi } from './api-simulada';

/** Panel admin: buscador + filtros avanzados de las tablas (ejemplo: /administracion/posts). */

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const JWT = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: 'admin', role: 'Administrador' })}.firma`;
const SESION = { usuario: { id: 'MQ==', userName: 'admin', rango: 'Administrador', avatar: '' }, token: `Bearer ${JWT}`, refreshToken: 'r' };

const post = (id: number, titulo: string, eliminado = false) => ({
  id,
  titulo,
  url: titulo.toLowerCase().replace(/ /g, '-'),
  etiquetas: 'demo,prueba',
  puntos: id * 3,
  fechaRegistro: new Date(Date.now() - id * 3600000).toISOString(),
  sticky: id === 1,
  eliminado,
  ip: '10.0.0.' + id,
  userName: 'autor' + id,
  categoria: { id: 1, nombre: 'Info', seo: 'info', icono: 'info.png' },
});

async function abrirPostsAdmin(page: Page): Promise<URL[]> {
  const pedidos: URL[] = [];
  await simularApi(page);
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(SESION));
  await page.route('**/api/parametros/getCategoriasDropdown**', (r) =>
    r.fulfill({ json: { status: 200, errors: [], data: [{ id: 1, nombre: 'Info' }, { id: 2, nombre: 'Juegos' }] } })
  );
  await page.route('**/api/categorias/getCategoriasDropdown**', (r) =>
    r.fulfill({ json: { status: 200, errors: [], data: [{ id: 1, nombre: 'Info' }, { id: 2, nombre: 'Juegos' }] } })
  );
  await page.route('**/api/posts/getPostsAdmin**', (route) => {
    const url = new URL(route.request().url());
    pedidos.push(url);
    const sinResultados = url.searchParams.get('q') === 'zzz';
    return route.fulfill({
      json: {
        status: 200,
        errors: [],
        data: {
          data: sinResultados ? [] : [post(1, 'Guía de Angular'), post(2, 'Post borrado', true), post(3, 'Otro post')],
          pagination: { totalCount: sinResultados ? 0 : 3, pageSize: 25, currentPage: 1, totalPages: 1 },
        },
      },
    });
  });
  await page.goto('/administracion/posts');
  await expect(page.locator('app-table-posts tbody tr')).toHaveCount(3);
  return pedidos;
}

test('buscador, filtros avanzados y estado vacío', async ({ page }, info) => {
  const pedidos = await abrirPostsAdmin(page);
  const ultimo = () => pedidos[pedidos.length - 1].searchParams;

  await expect(page.locator('.adm-filtros__total')).toContainText('3 resultados');
  await expect(page.locator('tr.row-deleted')).toHaveCount(1);

  // Buscar (con pausa) manda q y vuelve a la página 1.
  await page.getByLabel(/Buscar por título/).fill('angular');
  await expect.poll(() => ultimo().get('q')).toBe('angular');
  expect(ultimo().get('page')).toBe('1');

  // Filtros avanzados.
  await page.getByRole('button', { name: /Filtros/ }).click();
  await expect(page.locator('.adm-filtros__panel')).toBeVisible();
  await page.screenshot({ path: info.outputPath('admin-posts-filtros.png'), fullPage: true });

  await page.locator('.adm-campo', { hasText: 'Estado' }).locator('select').selectOption('eliminados');
  await expect.poll(() => ultimo().get('estado')).toBe('eliminados');

  await page.locator('.adm-campo', { hasText: 'Tipo' }).locator('select').selectOption('sticky');
  await expect.poll(() => ultimo().get('tipo')).toBe('sticky');

  await page.locator('.adm-campo', { hasText: 'Categoría' }).locator('select').selectOption({ label: 'Juegos' });
  await expect.poll(() => ultimo().get('categoriaId')).toBe('2');

  await page.locator('.adm-campo', { hasText: 'Desde' }).locator('input').fill('2026-10-01');
  await page.locator('.adm-campo', { hasText: 'Desde' }).locator('input').dispatchEvent('change');
  await expect.poll(() => ultimo().get('desde')).toBe('2026-10-01');

  await page.locator('.adm-campo', { hasText: 'Autor' }).locator('input').fill('pepe');
  await expect.poll(() => ultimo().get('usuario')).toBe('pepe');

  await expect(page.locator('.adm-filtros__badge')).toHaveText('5');

  // Limpiar deja la consulta sin filtros.
  await page.getByRole('button', { name: 'Limpiar' }).click();
  await expect.poll(() => ultimo().get('q')).toBeNull();
  for (const p of ['estado', 'tipo', 'categoriaId', 'desde', 'usuario']) expect(ultimo().get(p)).toBeNull();

  // Sin resultados: estado vacío que menciona los filtros.
  await page.getByLabel(/Buscar por título/).fill('zzz');
  await expect(page.locator('.adm-vacio')).toContainText('No hay resultados con estos filtros');
});

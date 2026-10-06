import { expect, Page, test } from '@playwright/test';
import { AUTOR, FOTO, POST, TEMA, simularApi } from './api-simulada';

/** Páginas de detalle (post, tema, foto): contenido, compartir y comentarios con <app-comentarios>. */

const paginas = [
  { nombre: 'post', ruta: `/posts/${POST.categoria.seo}/${POST.id}/${POST.url}`, titulo: POST.titulo, comentarios: 3 },
  { nombre: 'tema', ruta: `/comunidades/${TEMA.comunidad.nombreCorto}/tema/${TEMA.id}/${TEMA.url}`, titulo: TEMA.titulo, comentarios: 3 },
  { nombre: 'foto', ruta: `/fotos/${AUTOR}/${FOTO.id}/${FOTO.url}`, titulo: FOTO.titulo, comentarios: 2 },
];

async function sinScrollHorizontal(page: Page): Promise<void> {
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(desborde, 'la página no debe desbordar en horizontal').toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await simularApi(page);
});

for (const p of paginas) {
  test.describe(`detalle de ${p.nombre}`, () => {
    test('muestra título, compartir y comentarios', async ({ page }) => {
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(e.message));
      // Los errores de plantilla los atrapa el ErrorHandler de Angular y los reporta al API en vez de lanzarlos.
      // Se ignoran los fallos HTTP: el API simulado corta a propósito las rutas que no simula.
      page.on('request', (r) => {
        if (!/\/api\/appLogs\/cliente/i.test(r.url())) return;
        const cuerpo = r.postData() ?? '';
        if (!cuerpo.includes('Something bad happened')) errores.push(cuerpo || 'error reportado por ClientErrorHandler');
      });

      await page.goto(p.ruta);

      await expect(page.locator('h1.detail-main-title')).toHaveText(p.titulo);
      // La URL ya es la canónica: no debe redirigir.
      await expect(page).toHaveURL(new RegExp(`${p.ruta}$`));

      const compartir = page.locator('.detail-share');
      await expect(compartir.getByRole('button', { name: 'Compartir en X' })).toBeVisible();
      await expect(compartir.getByRole('button', { name: 'Compartir en WhatsApp' })).toBeVisible();

      const seccion = page.locator('app-comentarios .tema-coments');
      await expect(seccion.locator('h3')).toHaveText(`Comentarios (${p.comentarios})`);
      await expect(seccion.locator('.coment')).toHaveCount(p.comentarios);
      // Al menos una respuesta anidada, escrita por el autor y marcada como OP.
      await expect(seccion.locator('.coment-respuestas .coment-op').first()).toHaveText('OP');
      await expect(seccion.locator('.coment-orden button')).toHaveText(['Mejores', 'Recientes', 'Controvertido']);

      await sinScrollHorizontal(page);
      expect(errores, 'sin errores de JavaScript').toEqual([]);
    });

    test('cambiar el orden mantiene los comentarios', async ({ page }) => {
      await page.goto(p.ruta);
      const seccion = page.locator('app-comentarios .tema-coments');
      await expect(seccion.locator('.coment')).toHaveCount(p.comentarios);

      await seccion.getByRole('button', { name: 'Recientes' }).click();
      await expect(seccion.getByRole('button', { name: 'Recientes' })).toHaveClass(/active/);
      await expect(seccion.locator('.coment')).toHaveCount(p.comentarios);
    });
  });
}

test('el comentario con enlace se convierte en link seguro', async ({ page }) => {
  await page.goto(paginas[0].ruta);
  const enlace = page.locator('app-comentarios a[href="https://ejemplo.com"]');
  await expect(enlace).toHaveAttribute('rel', /noopener/);
  await expect(enlace).toHaveAttribute('target', '_blank');
});

test('el enlace #comentario-{id} baja al comentario y lo resalta unos segundos', async ({ page }) => {
  await page.goto(`${paginas[0].ruta}#comentario-2`);
  const comentario = page.locator('#comentario-2');
  await expect(comentario).toHaveClass(/coment--resaltado/);
  await expect(comentario).toBeInViewport();
  await expect(comentario).not.toHaveClass(/coment--resaltado/, { timeout: 6000 });
});

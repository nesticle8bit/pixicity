import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { AUTOR, FOTO, POST, TEMA, simularApi } from './api-simulada';

/**
 * Accesibilidad (WCAG 2.1 A/AA) con axe-core sobre las páginas principales. Falla con violaciones serias o
 * críticas; las moderadas/menores se listan en el reporte sin romper el build.
 */

const paginas = [
  { nombre: 'portada', ruta: '/' },
  { nombre: 'post', ruta: `/posts/${POST.categoria.seo}/${POST.id}/${POST.url}`, espera: 'h1.detail-main-title' },
  { nombre: 'tema', ruta: `/comunidades/${TEMA.comunidad.nombreCorto}/tema/${TEMA.id}/${TEMA.url}`, espera: 'h1.detail-main-title' },
  { nombre: 'foto', ruta: `/fotos/${AUTOR}/${FOTO.id}/${FOTO.url}`, espera: 'h1.detail-main-title' },
  { nombre: 'login', ruta: '/login' },
  { nombre: 'registro', ruta: '/registro' },
  { nombre: 'buscar', ruta: '/buscar' },
];

test.beforeEach(async ({ page }) => {
  await simularApi(page);
});

for (const p of paginas) {
  test.setTimeout(60_000);
  test(`sin violaciones graves de accesibilidad: ${p.nombre}`, async ({ page }, testInfo) => {
    await page.goto(p.ruta);
    if (p.espera) {
      await page.locator(p.espera).waitFor();
    } else {
      await page.waitForLoadState('networkidle');
    }

    const resultado = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Contenido de terceros que no controlamos (widget de Discord, anuncios): axe no entra a los iframes.
      .options({ iframes: false })
      // Estados atenuados a propósito (cargando, eliminado en el admin).
      .exclude('.opacity-50')
      .analyze();

    const graves = resultado.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const resumen = resultado.violations.map((v) => `${v.impact}: ${v.id} (${v.nodes.length}) ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    await testInfo.attach('axe', { body: JSON.stringify(resumen, null, 2), contentType: 'application/json' });

    expect(graves.map((v) => `${v.id}: ${v.help} -> ${v.nodes.slice(0, 5).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });
}

test('el enlace "Saltar al contenido" lleva el foco al contenido principal', async ({ page }) => {
  await page.goto(`/posts/${POST.categoria.seo}/${POST.id}/${POST.url}`);
  await page.locator('h1.detail-main-title').waitFor();

  await page.keyboard.press('Tab');
  const salto = page.locator('a.skip-link');
  await expect(salto).toBeFocused();
  // Visible al recibir el foco (oculto arriba de la pantalla el resto del tiempo).
  await expect.poll(async () => (await salto.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);

  await page.keyboard.press('Enter');
  await expect(page.locator('#contenido-principal')).toBeFocused();
  // No navegó (con <base href="/"> un #ancla mal manejado iría a la portada).
  await expect(page).toHaveURL(new RegExp(`${POST.url}$`));
});

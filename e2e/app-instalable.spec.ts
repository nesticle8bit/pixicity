import { expect, test } from '@playwright/test';
import { simularApi } from './api-simulada';

test.beforeEach(async ({ page }) => {
  await simularApi(page);
});

test('app instalable: manifest válido, service worker activo y página propia sin conexión', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'escritorio', 'la instalabilidad la revisa Chrome igual en los dos');
  await page.goto('/');
  await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration())?.active, null, { timeout: 15_000 });

  // Lo mismo que revisa Chrome antes de ofrecer "Instalar app" (en una sesión de prueba solo falta no ser incógnito).
  const cdp = await context.newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  expect(installabilityErrors.map((e) => e.errorId).filter((id) => id !== 'in-incognito')).toEqual([]);
  const { errors } = await cdp.send('Page.getAppManifest');
  expect(errors).toEqual([]);

  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest).toMatchObject({ name: 'Taringas!', display: 'standalone', start_url: '/mi' });
  expect(manifest.icons.map((i: { sizes: string; purpose: string }) => `${i.sizes} ${i.purpose}`)).toEqual(
    expect.arrayContaining(['512x512 any', '512x512 maskable']),
  );

  // Sin internet, la app muestra su propia página en vez del dinosaurio del navegador.
  await context.setOffline(true);
  await page.goto('/mi').catch(() => undefined);
  await expect(page.getByRole('heading', { name: 'Sin conexión' })).toBeVisible();
  await context.setOffline(false);
});

test('app instalable: el menú del celular ofrece instalarla cuando el navegador lo permite', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil', 'el cajón solo existe en el celular');
  await page.goto('/');
  // Simula el aviso de Chrome/Android: el diálogo real no se puede abrir en una prueba.
  await page.evaluate(() => {
    const e = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: async () => ((window as unknown as { instalacionPedida: boolean }).instalacionPedida = true),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });
    window.dispatchEvent(e);
  });

  await page.getByRole('button', { name: /^Abrir menú/ }).click();
  const menu = page.getByRole('dialog', { name: 'Menú principal' });
  await menu.getByRole('button', { name: 'Instalar la app en el celular' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { instalacionPedida?: boolean }).instalacionPedida)).toBe(true);
  // Instalada: la opción desaparece.
  await page.getByRole('button', { name: /^Abrir menú/ }).click();
  await expect(menu.getByRole('button', { name: 'Instalar la app en el celular' })).toBeHidden();
});

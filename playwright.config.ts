import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas en navegador (e2e) sobre el build de producción.
 *
 *   npm run build && npm run e2e
 *
 * El API se simula en cada prueba (e2e/api-simulada.ts), así que no hace falta backend ni base de datos.
 * En local usa el Edge instalado (sin descargar navegadores); en CI usa el Chromium de Playwright.
 */
const PUERTO = 4300;
const enCI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: enCI,
  retries: enCI ? 1 : 0,
  reporter: enCI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], channel: enCI ? undefined : 'msedge' },
    },
    {
      name: 'movil',
      use: { ...devices['Pixel 7'], channel: enCI ? undefined : 'msedge' },
    },
  ],
  webServer: {
    command: `node scripts/servir-dist.js --port ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !enCI,
  },
});

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
  // En local, un tercio de los núcleos (2 en una máquina de 6). Con la mitad (el valor por defecto) Edge + axe
  // saturaban la CPU: el navegador dejaba de pintar ~15 s, los clics no llegaban a tiempo y fallaban pruebas al azar
  // (favoritos, comentarios, /mi). Con 2 pasaron 85/85 repeticiones, y más rápido que con 3.
  workers: enCI ? undefined : '33%',
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

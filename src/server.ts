import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

// El SSR solo atiende bots, que nunca tienen sesión: localStorage/sessionStorage se reemplazan por un almacén vacío
// que no guarda nada (getItem siempre null). Así el código que lee la sesión al arrancar no falla y nada se comparte
// entre peticiones de distintos visitantes.
class AlmacenVacio implements Storage {
  readonly length = 0;
  clear(): void {}
  getItem(): string | null {
    return null;
  }
  key(): string | null {
    return null;
  }
  removeItem(): void {}
  setItem(): void {}
}
for (const nombre of ['localStorage', 'sessionStorage'] as const) {
  if (!(nombre in globalThis)) {
    Object.defineProperty(globalThis, nombre, { value: new AlmacenVacio(), configurable: true });
  }
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
// nginx (delante del SSR) agrega X-Forwarded-For / X-Forwarded-Proto. Angular rechaza por seguridad las cabeceras
// de proxy no declaradas y, en vez de renderizar, devuelve la app de cliente vacía: los bots no veían contenido.
// No se confía en X-Forwarded-Host (permitiría falsear el host); el host lo valida security.allowedHosts.
const angularApp = new AngularNodeAppEngine({ trustProxyHeaders: ['x-forwarded-for', 'x-forwarded-proto'] });

/** Salud del servidor SSR (healthcheck de Docker y monitores). */
app.get('/ssr-health', (_req, res) => {
  res.type('text/plain').send('ok');
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

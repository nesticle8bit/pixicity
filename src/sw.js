/*
 * Service worker de la app instalada (PWA). A propósito NO cachea nada: cada apertura va a la red, así un deploy se
 * ve al instante también en la app del celular (igual que en el navegador). Solo atiende las navegaciones para
 * mostrar una página propia cuando no hay conexión; el resto de las peticiones (API, assets, imágenes) no pasa por acá.
 *
 * Si se cambia este archivo, el navegador instala la versión nueva solo (lo revisa en cada navegación; nginx lo sirve
 * sin caché, ver nginx-custom.conf).
 */
const SIN_CONEXION = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sin conexión · Taringas!</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box;
    font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; text-align: center;
    background: light-dark(#f4f8fa, #16191c); color: light-dark(#26323a, #c7d2da); }
  .logo { width: 72px; height: 72px; border-radius: 16px; margin: 0 auto 16px; display: block; }
  h1 { margin: 0 0 6px; font-size: 1.25rem; }
  p { margin: 0 0 20px; }
  button { min-height: 44px; padding: 0 22px; border: 0; border-radius: 999px; background: #005bb3; color: #fff;
    font: inherit; font-weight: 700; }
</style></head>
<body><main>
  <img class="logo" src="/assets/favicon/pwa-192.png" alt="" width="72" height="72">
  <h1>Sin conexión</h1>
  <p>Revisa tu internet y vuelve a intentarlo.</p>
  <button type="button" onclick="location.reload()">Reintentar</button>
</main></body></html>`;

self.addEventListener('install', (event) => {
  // El ícono de la página sin conexión queda guardado para poder mostrarlo sin red.
  event.waitUntil(caches.open('sin-conexion-v1').then((c) => c.add('/assets/favicon/pwa-192.png')).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== 'sin-conexion-v1').map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => new Response(SIN_CONEXION, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })),
    );
    return;
  }
  // Solo el ícono de la página sin conexión sale de la caché si no hay red.
  if (req.method === 'GET' && new URL(req.url).pathname === '/assets/favicon/pwa-192.png') {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});

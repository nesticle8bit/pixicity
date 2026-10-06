#!/usr/bin/env node
/**
 * Servidor estático mínimo para el build de producción, con fallback SPA a index.html.
 * Lo usa Playwright (playwright.config.ts) para las pruebas e2e; el API se simula dentro de cada prueba.
 *
 *   node scripts/servir-dist.js [--dist dist/pixicity/browser] [--port 4300]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const root = path.resolve(arg('dist', path.join(__dirname, '..', 'dist', 'pixicity', 'browser')));
const port = Number(arg('port', 4300));

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error(`No existe ${root}/index.html. Genera el build primero (npm run build).`);
  process.exit(2);
}

const mime = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

http
  .createServer((req, res) => {
    // normalize + comprobación de prefijo: no se sirve nada fuera de la carpeta del build.
    const pedido = path.normalize(path.join(root, decodeURIComponent(req.url.split('?')[0])));
    const dentro = pedido.startsWith(root);
    const archivo = dentro && fs.existsSync(pedido) && fs.statSync(pedido).isFile() ? pedido : path.join(root, 'index.html');
    res.writeHead(200, { 'Content-Type': mime[path.extname(archivo)] || 'application/octet-stream' });
    fs.createReadStream(archivo).pipe(res);
  })
  .listen(port, () => console.log(`Sirviendo ${root} en http://localhost:${port}`));

#!/usr/bin/env node
/**
 * Verificación visual/funcional del header, menú y cajón móvil en un navegador real (Edge/Chrome headless por CDP).
 *
 *   ng build --configuration development --output-path dist/check
 *   node scripts/responsive-check.js            (usa dist/check/browser)
 *   node scripts/responsive-check.js --dist <carpeta/browser> --out <carpeta capturas> --browser <ruta exe>
 *
 * Sirve el build estático y simula el API en environment.api (puerto 58882), así que no toca ningún servidor real.
 * Guarda capturas en --out y sale con código 1 si alguna comprobación falla.
 * Requiere el paquete "ws" (ya presente como dependencia transitiva de karma).
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const root = path.resolve(arg('dist', path.join(__dirname, '..', 'dist', 'check', 'browser')));
const outDir = path.resolve(arg('out', path.join(os.tmpdir(), 'pixicity-responsive')));
const browserPath = arg(
  'browser',
  [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => fs.existsSync(p))
);
const APP_PORT = 4299;
const API_PORT = 58882; // environment.development.api
const CDP_PORT = 9333;

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error(`No existe ${root}/index.html. Genera el build primero (ver cabecera del script).`);
  process.exit(2);
}
if (!browserPath) {
  console.error('No se encontró Edge/Chrome. Usa --browser <ruta>.');
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });

const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

// App estática con fallback SPA.
const appServer = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  const file = fs.existsSync(p) && fs.statSync(p).isFile() ? p : path.join(root, 'index.html');
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

// API simulada: solo los contadores responden con valores conocidos. El resto se corta como si el servidor
// estuviera apagado (la app lo tolera); responder datos vacíos inventados deja trabado el overlay de carga.
const apiServer = http.createServer((req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };
  if (!/getStats/i.test(req.url)) return req.socket.destroy();
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    return res.end();
  }
  res.writeHead(200, headers);
  res.end(JSON.stringify({ status: 200, data: { notifications: 3, messages: 2 }, errors: [] }));
});

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const fakeJwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: 'demo' })}.firma`;
const sesion = { usuario: { id: 1, userName: 'demo', rango: 'Usuario', avatar: '' }, token: `Bearer ${fakeJwt}`, refreshToken: 'r' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (nombre, ok, detalle = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nombre}${detalle ? `  (${detalle})` : ''}`);
  if (!ok) failures++;
};

(async () => {
  await new Promise((r) => appServer.listen(APP_PORT, r));
  await new Promise((r) => apiServer.listen(API_PORT, r));

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pixicity-edge-'));
  const browser = spawn(browserPath, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  await sleep(2500);

  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json`)).json();
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.on('open', r));

  let id = 0;
  const pending = new Map();
  ws.on('message', (m) => {
    const d = JSON.parse(m);
    if (d.id && pending.has(d.id)) {
      pending.get(d.id)(d);
      pending.delete(d.id);
    }
  });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
  const shot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(r.result.data, 'base64'));
  };
  const touch = async (type, x, y) => send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });

  await send('Page.enable');
  await send('Runtime.enable');

  const abrir = async (ancho, conSesion) => {
    await send('Emulation.setDeviceMetricsOverride', { width: ancho, height: 760, deviceScaleFactor: 2, mobile: ancho < 768 });
    await send('Emulation.setTouchEmulationEnabled', { enabled: ancho < 768 });
    await send('Page.navigate', { url: 'about:blank' });
    await js(`localStorage.clear()`);
    const { result } = await send('Page.addScriptToEvaluateOnNewDocument', {
      source: conSesion ? `localStorage.setItem('taringas', ${JSON.stringify(JSON.stringify(sesion))})` : `localStorage.removeItem('taringas')`,
    });
    await send('Page.navigate', { url: `http://localhost:${APP_PORT}/` });
    await sleep(4500);
    return result.identifier;
  };

  for (const [ancho, conSesion] of [[375, false], [320, false], [375, true], [820, false]]) {
    const etiqueta = `${ancho}${conSesion ? '-sesion' : '-invitado'}`;
    console.log(`\n== ${etiqueta} ==`);
    const scriptId = await abrir(ancho, conSesion);
    await shot(`${etiqueta}-cerrado`);

    const info = JSON.parse(await js(`JSON.stringify({
      sinScrollHorizontal: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      hamburguesaVisible: !!document.querySelector('#mobile-nav-toggle') && getComputedStyle(document.querySelector('#mobile-nav-toggle').parentElement).display !== 'none',
      menuUserDesktopVisible: !!document.querySelector('app-section-user-info-login') && getComputedStyle(document.querySelector('app-section-user-info-login').parentElement).display !== 'none',
      tabsEnUnaFila: (() => { const u = document.querySelector('.main-menu ul'); const t = [...u.children].filter(c => c.offsetParent !== null).map(c => c.getBoundingClientRect().top); return Math.max(...t) - Math.min(...t) < 4; })(),
      subMenuUnaFila: (() => { const u = document.querySelector('.sub-menu ul'); if (!u) return true; const t = [...u.children].filter(c => c.offsetParent !== null).map(c => c.getBoundingClientRect().top); return Math.max(...t) - Math.min(...t) < 4; })(),
      badge: (document.querySelector('.mobile-actions__badge') || {}).textContent
    })`));

    check('sin scroll horizontal', info.sinScrollHorizontal);

    if (ancho < 768) {
      check('hamburguesa visible', info.hamburguesaVisible);
      check('menú de escritorio oculto', !info.menuUserDesktopVisible);
      check('pestañas del menú en una sola fila', info.tabsEnUnaFila);
      check('submenú en una sola fila', info.subMenuUnaFila);
      if (conSesion) check('badge suma notificaciones + mensajes (3+2)', (info.badge || '').trim() === '5', `badge="${info.badge}"`);

      // Abrir
      await js(`document.querySelector('#mobile-nav-toggle').click()`);
      await sleep(600);
      await shot(`${etiqueta}-abierto`);
      check('abre: aria-expanded=true', (await js(`document.querySelector('#mobile-nav-toggle').getAttribute('aria-expanded')`)) === 'true');
      check('abre: foco en el botón cerrar', (await js(`document.activeElement.className`)).includes('drawer__close'));
      check('abre: scroll de la página bloqueado', (await js(`document.body.style.overflow`)) === 'hidden');
      if (conSesion) {
        const enlaces = JSON.parse(await js(`JSON.stringify([...document.querySelectorAll('#mobile-drawer a')].map(a => a.getAttribute('href')))`));
        check('cajón con sesión: monitor, mensajes, favoritos, perfil y cuenta', ['/monitor', '/mensajes', '/favoritos', '/perfil/demo', '/cuenta'].every((h) => enlaces.includes(h)));
      }

      // Cerrar con Escape y devolver el foco
      await js(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))`);
      await sleep(400);
      check('Escape cierra y devuelve el foco a la hamburguesa', (await js(`document.activeElement.id`)) === 'mobile-nav-toggle');
      check('cerrar libera el scroll', (await js(`document.body.style.overflow`)) === '');

      // Deslizar para cerrar
      await js(`document.querySelector('#mobile-nav-toggle').click()`);
      await sleep(500);
      await touch('touchStart', 200, 400);
      for (const x of [230, 280, 330]) { await touch('touchMove', x, 405); await sleep(30); }
      await touch('touchEnd');
      await sleep(500);
      check('deslizar a la derecha cierra el cajón', (await js(`document.querySelector('#mobile-nav-toggle').getAttribute('aria-expanded')`)) === 'false');

      // Header que se esconde al bajar
      const alto = await js(`document.documentElement.scrollHeight`);
      if (alto > 1100) {
        await js(`window.scrollTo(0, 500)`); await sleep(500);
        const oculto = await js(`document.querySelector('main-header').getBoundingClientRect().bottom <= 1`);
        await shot(`${etiqueta}-scroll-abajo`);
        check('bajar: el header se esconde', oculto);
        await js(`window.scrollTo(0, 380)`); await sleep(500);
        check('subir: el header reaparece', await js(`document.querySelector('main-header').getBoundingClientRect().top >= -1`));
      } else {
        console.log(`SKIP  scroll del header (la página mide ${alto}px)`);
      }
    } else {
      check('escritorio: sin hamburguesa', !info.hamburguesaVisible);
      check('escritorio: menú de usuario visible', info.menuUserDesktopVisible);
      check('escritorio: cajón oculto', (await js(`getComputedStyle(document.querySelector('app-mobile-drawer')).display`)) === 'none');
    }
  }

  // Rutas cargadas de forma diferida: cada una debe renderizar su componente (si faltara un módulo de Material o de
  // enrutamiento en el módulo diferido, el componente no aparecería) y las rutas antiguas deben redirigir.
  console.log('\n== rutas diferidas ==');
  await abrir(1280, true);
  const rutas = [
    ['/fotos', 'app-fotos-index', '/fotos'],
    ['/fotos/crear', 'app-foto-create', '/fotos/crear'],
    ['/crear/foto', 'app-foto-create', '/fotos/crear'],       // ruta anterior: redirige
    ['/fotos/demo/1/mi-foto', 'app-foto-detail', '/fotos/demo/1/mi-foto'],
    ['/mensajes', 'app-mensajes', '/mensajes'],
    ['/mensajes/chat/ana', 'app-mensajes-conversacion', '/mensajes/chat/ana'],
    ['/mensajes/enviados', 'app-mensajes', '/mensajes'],      // ruta anterior: redirige
    ['/cuenta', 'app-account', '/cuenta'],
  ];
  for (const [url, selector, esperada] of rutas) {
    await send('Page.navigate', { url: `http://localhost:${APP_PORT}${url}` });
    await sleep(3500);
    const estado = JSON.parse(await js(`JSON.stringify({ existe: !!document.querySelector('${selector}'), ruta: location.pathname })`));
    check(`${url} → <${selector}>`, estado.existe && estado.ruta === esperada, `ruta final ${estado.ruta}`);
  }
  await shot('lazy-cuenta');

  ws.close();
  browser.kill();
  appServer.close();
  apiServer.close();
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* el navegador puede tardar en soltar el perfil */ }

  console.log(`\nCapturas en: ${outDir}`);
  console.log(failures ? `\n${failures} comprobación(es) fallaron` : '\nTodo en orden');
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});

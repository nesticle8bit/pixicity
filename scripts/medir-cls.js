#!/usr/bin/env node
/**
 * Mide el Cumulative Layout Shift (CLS) de páginas reales y dice qué elementos se mueven.
 *
 *   node scripts/medir-cls.js [https://taringas.net] [--movil]
 *   node scripts/medir-cls.js http://localhost:4300 --api-produccion   (build local + datos reales de producción)
 *
 * Usa el Edge instalado (como los e2e). Bueno: CLS <= 0.1 (umbral de Google para Core Web Vitals).
 */
const { chromium, devices } = require('@playwright/test');

const base = (process.argv.find((a) => a.startsWith('http')) || 'https://taringas.net').replace(/\/$/, '');
const movil = process.argv.includes('--movil');
// Sirve el build local (npm run build + node scripts/servir-dist.js) pero pide /api e /images a producción.
const apiProduccion = process.argv.includes('--api-produccion');
const RUTAS = [
  '/',
  '/tops',
  '/posts/ebooks-tutoriales/83/los-disc%C3%ADpulos-de-cthulhu-%E2%80%94-a.-a.-attanasio--1976-',
  '/comunidades/comunismo/tema/1/%C2%BFque-es-el-comunismo%3F',
  '/perfil/Gorgoroth',
  '/fotos',
  '/fotos/Gorgoroth/18/zelda-ocarine-of-time---digital-wallpaper',
];

(async () => {
  const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'msedge' });
  const context = await browser.newContext(movil ? devices['Pixel 7'] : { viewport: { width: 1366, height: 800 } });
  if (apiProduccion) {
    await context.route(/\/(api|images)\//, async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/hubs/')) return route.abort();
      const respuesta = await route.fetch({ url: 'https://taringas.net' + url.pathname + url.search }).catch(() => null);
      return respuesta ? route.fulfill({ response: respuesta }) : route.abort();
    });
  }
  await context.addInitScript(() => {
    window.__cls = { total: 0, fuentes: [] };
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__cls.total += e.value;
        for (const s of e.sources || []) {
          const n = s.node;
          if (!n || !n.nodeType) continue;
          const el = n.nodeType === 1 ? n : n.parentElement;
          const desc = el ? `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}` : '?';
          window.__cls.fuentes.push({ valor: e.value, desc });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  let peor = 0;
  for (const ruta of RUTAS) {
    const page = await context.newPage();
    await page.goto(base + ruta, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => window.__cls);
    // Elementos que más aportan (agrupados por descripción).
    const porEl = {};
    for (const f of r.fuentes) porEl[f.desc] = (porEl[f.desc] || 0) + f.valor;
    const top = Object.entries(porEl).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([d, v]) => `${d} (${v.toFixed(3)})`);
    peor = Math.max(peor, r.total);
    console.log(`${r.total <= 0.1 ? 'OK ' : 'MAL'} CLS ${r.total.toFixed(3)}  ${ruta.slice(0, 60)}\n      ${top.join('\n      ')}`);
    await page.close();
  }
  await browser.close();
  console.log(`\nPeor CLS: ${peor.toFixed(3)} (${movil ? 'móvil' : 'escritorio'})`);
})();

#!/usr/bin/env node
/**
 * Genera un subconjunto de la fuente de íconos Tabler con SOLO los íconos que usa la app.
 *
 * Por qué: tabler-icons.woff2 pesa ~500 KB y su CSS ~210 KB, y se descargan completos en la primera visita
 * aunque la app usa ~120 de más de 5.000 íconos. El subconjunto pesa unas decenas de KB.
 *
 *   node scripts/build-icon-subset.js           genera src/assets/fonts/tabler-icons-subset.woff2
 *                                               y src/assets/styles/tabler-icons-subset.scss
 *   node scripts/build-icon-subset.js --check   no escribe nada; falla (código 1) si el código usa algún ícono
 *                                               que NO está en el subconjunto generado (para CI)
 *
 * Cuándo ejecutarlo: al usar un ícono nuevo (clase "ti-algo") en una plantilla, un .ts o un .scss.
 * Íconos que se arman dinámicamente (p. ej. 'ti-' + nombre) no se detectan: agrégalos a scripts/icons-extra.txt.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const tablerCss = path.join(root, 'node_modules/@tabler/icons-webfont/dist/tabler-icons.css');
const tablerTtf = path.join(root, 'node_modules/@tabler/icons-webfont/dist/fonts/tabler-icons.ttf');
const extraFile = path.join(__dirname, 'icons-extra.txt');
const outFont = path.join(root, 'src/assets/fonts/tabler-icons-subset.woff2');
const outScss = path.join(root, 'src/assets/styles/tabler-icons-subset.scss');
const checkOnly = process.argv.includes('--check');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|html|scss)$/.test(entry.name) && !/\.spec\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

function usedIcons() {
  const used = new Set();
  const sources = [...walk(path.join(root, 'src/app')), path.join(root, 'src/index.html'), path.join(root, 'src/styles.scss')];

  for (const file of sources) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/\bti-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) used.add(m[1]);
  }

  if (fs.existsSync(extraFile)) {
    for (const line of fs.readFileSync(extraFile, 'utf8').split(/\r?\n/)) {
      const name = line.replace(/#.*/, '').trim().replace(/^ti-/, '');
      if (name) used.add(name);
    }
  }

  return used;
}

// nombre -> codepoint, leído del CSS oficial de Tabler
function knownIcons() {
  const css = fs.readFileSync(tablerCss, 'utf8');
  const map = new Map();
  for (const m of css.matchAll(/\.ti-([a-z0-9-]+):before\s*\{\s*content:\s*"\\([0-9a-f]+)"/g)) map.set(m[1], m[2]);
  return map;
}

(async () => {
  const known = knownIcons();
  const used = usedIcons();

  // Clases "ti-*" que no son íconos (utilidades de la fuente o de la app) se ignoran, pero se informan.
  const icons = [...used].filter((n) => known.has(n)).sort();
  const ignored = [...used].filter((n) => !known.has(n)).sort();

  if (checkOnly) {
    const generated = fs.existsSync(outScss) ? fs.readFileSync(outScss, 'utf8') : '';
    const present = new Set([...generated.matchAll(/\.ti-([a-z0-9-]+):before/g)].map((m) => m[1]));
    const missing = icons.filter((n) => !present.has(n));

    if (missing.length) {
      console.error(`Faltan ${missing.length} íconos en el subconjunto: ${missing.map((n) => 'ti-' + n).join(', ')}`);
      console.error('Ejecuta: node scripts/build-icon-subset.js');
      process.exit(1);
    }

    console.log(`OK: los ${icons.length} íconos usados están en el subconjunto.`);
    return;
  }

  const subsetFont = (await import('subset-font')).default;
  const text = icons.map((n) => String.fromCodePoint(parseInt(known.get(n), 16))).join('');
  const font = await subsetFont(fs.readFileSync(tablerTtf), text, { targetFormat: 'woff2' });

  fs.mkdirSync(path.dirname(outFont), { recursive: true });
  fs.writeFileSync(outFont, font);

  const rules = icons.map((n) => `.ti-${n}:before { content: "\\${known.get(n)}"; }`).join('\n');
  fs.writeFileSync(
    outScss,
    `// GENERADO por scripts/build-icon-subset.js — no editar a mano.
// Subconjunto de Tabler Icons con solo los íconos que usa la app (${icons.length}).
@font-face {
  font-family: "tabler-icons";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/assets/fonts/tabler-icons-subset.woff2") format("woff2");
}

.ti {
  font-family: "tabler-icons" !important;
  speak: none;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

${rules}
`
  );

  console.log(`${icons.length} íconos -> ${(font.length / 1024).toFixed(1)} KB de fuente (la original pesa ${(fs.statSync(tablerTtf).size / 1024 / 1024).toFixed(1)} MB en TTF / ~500 KB en WOFF2).`);
  if (ignored.length) console.log(`Clases ti-* ignoradas (no son íconos de Tabler): ${ignored.join(', ')}`);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});

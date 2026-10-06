#!/usr/bin/env node
/**
 * Trinquete de tipado: cuenta los usos de `any` en src/app (sin los .spec.ts) y falla si hay más que en la línea base.
 * Así el número solo puede bajar. Al tipar un archivo, actualiza la base con:
 *
 *   node scripts/check-any.js --actualizar
 */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', 'src', 'app');
const archivoBase = path.join(__dirname, 'any-baseline.json');
const actualizar = process.argv.includes('--actualizar');

function recorrer(dir, out = []) {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) recorrer(ruta, out);
    else if (entrada.name.endsWith('.ts') && !entrada.name.endsWith('.spec.ts')) out.push(ruta);
  }
  return out;
}

let total = 0;
const porArchivo = [];
for (const archivo of recorrer(raiz)) {
  const n = (fs.readFileSync(archivo, 'utf8').match(/\bany\b/g) || []).length;
  if (n > 0) {
    total += n;
    porArchivo.push([path.relative(raiz, archivo), n]);
  }
}

if (actualizar) {
  fs.writeFileSync(archivoBase, JSON.stringify({ total }, null, 2) + '\n');
  console.log(`Línea base actualizada: ${total} usos de any.`);
  process.exit(0);
}

const base = fs.existsSync(archivoBase) ? JSON.parse(fs.readFileSync(archivoBase, 'utf8')).total : Infinity;

if (total > base) {
  console.error(`Hay ${total} usos de any y la línea base es ${base}: tipa el código nuevo en vez de usar any.`);
  console.error('Archivos con más usos:');
  porArchivo.sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([f, n]) => console.error(`  ${String(n).padStart(4)}  ${f}`));
  process.exit(1);
}

console.log(`OK: ${total} usos de any (línea base ${base}).${total < base ? ' Bajó: actualiza la base con --actualizar.' : ''}`);

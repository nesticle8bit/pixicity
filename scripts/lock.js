#!/usr/bin/env node
/**
 * Regenera package-lock.json con el MISMO Node/npm que usan el Dockerfile y el CI (node:22-alpine → npm 10).
 * Un lockfile hecho con otro npm (p. ej. npm 11 con Node 24) puede omitir dependencias opcionales que npm 10 exige,
 * y `npm ci` falla en el build ("package.json and package-lock.json are not in sync").
 *
 *   npm run lock      (después de agregar/actualizar dependencias; requiere Docker)
 */
const { execFileSync } = require('child_process');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
execFileSync('docker', [
  'run', '--rm', '-v', `${raiz}:/w`, '-w', '/tmp/l', 'node:22-alpine', 'sh', '-c',
  'cp /w/package.json /w/package-lock.json . && npm install --package-lock-only --ignore-scripts && cp package-lock.json /w/',
], { stdio: 'inherit', env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
console.log('package-lock.json regenerado con npm de node:22-alpine.');

import { expect, Locator, Page, test } from '@playwright/test';
import { simularApi } from './api-simulada';

/**
 * Editor de posts en un navegador real: imágenes insertadas donde está el cursor y cortar / copiar / pegar
 * imágenes. Son comportamientos del navegador (selección, portapapeles) que las pruebas unitarias no reproducen.
 */

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: 'lector_tres', role: 'Usuario' })}.firma`;
const ok = (data: unknown) => ({ json: { status: 200, errors: [], data } });
// PNG de 1×1: el API simulado devuelve una imagen distinta por subida (?n=1, ?n=2…)
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

let subidas = 0;
test.beforeEach(async ({ page }) => {
  subidas = 0;
  await simularApi(page);
  await page.route('**/api/fotos/imagenes', (r) => r.fulfill(ok(`/assets/images/avatar.png?n=${++subidas}`)));
  const sesion = { usuario: { id: 'MQ==', userName: 'lector_tres', rango: 'Usuario', avatar: '' }, token: `Bearer ${jwt}`, refreshToken: 'r' };
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(sesion));
  await page.goto('/crear/post');
});

const editor = (page: Page) => page.locator('.rich-editor__content');

/** Contenido como texto legible: un párrafo por línea, cada imagen como [img n]. */
function estructura(ed: Locator): Promise<string[]> {
  return ed.evaluate((el) =>
    Array.from(el.children).map((b) =>
      Array.from(b.childNodes)
        .map((n) => {
          const img = (n as HTMLElement).querySelector?.('img') ?? (n.nodeName === 'IMG' ? (n as HTMLImageElement) : null);
          if (img) return `[img ${new URL(img.src).searchParams.get('n') ?? '?'}]`;
          if (n.nodeName === 'BR') return '';
          return (n.textContent ?? '').replace(/​/g, '');
        })
        .join('')
        .trim(),
    ),
  );
}

/** Abre "Insertar imagen → Subir desde el equipo" y devuelve el selector de archivos. Con la emulación táctil y la
 *  máquina cargada el navegador a veces no entrega el filechooser: se reintenta una vez (un error real falla igual). */
async function abrirSelector(page: Page) {
  for (let intento = 0; ; intento++) {
    const elegido = page.waitForEvent('filechooser', { timeout: 8000 });
    await page.getByRole('button', { name: 'Insertar imagen' }).click();
    await page.getByRole('button', { name: 'Subir desde el equipo' }).click();
    try {
      return await elegido;
    } catch (e) {
      if (intento > 0) throw e;
    }
  }
}

async function subirImagen(page: Page): Promise<void> {
  await (await abrirSelector(page)).setFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.locator('.rich-editor__uploading')).toHaveCount(0);
}

const imagen = (page: Page, n: number) => editor(page).locator(`img[src*="n=${n}"]`);
/** El contenedor no editable es lo que recibe el clic (como con el mouse de verdad). */
const clicImagen = (page: Page, n: number) =>
  editor(page).locator('.img-resizable', { has: page.locator(`img[src*="n=${n}"]`) }).first().click();

test('la imagen subida va donde está el cursor, en medio de un párrafo', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Hola mundo');
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowLeft');

  await subirImagen(page);

  await expect.poll(() => estructura(ed)).toEqual(['Hola [img 1]mundo']);
});

test('la imagen subida va en el renglón vacío debajo de otra imagen, no al final del texto anterior', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Primero');
  await page.keyboard.press('Enter');
  await subirImagen(page);
  await page.keyboard.type('Segundo');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Tercero');
  // Cursor al renglón vacío entre "Segundo" y "Tercero"
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Home');

  await subirImagen(page);

  const bloques = (await estructura(ed)).filter((b) => b !== '');
  expect(bloques.indexOf('[img 2]')).toBe(bloques.indexOf('Tercero') - 1);
  expect(bloques.some((b) => b.includes('Primero[img'))).toBe(false);
});

test('la imagen desde una URL va donde está el cursor', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Arriba');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Abajo');
  await page.keyboard.press('ArrowUp');

  page.once('dialog', (d) => d.accept('http://localhost:4300/assets/images/avatar.png?n=9'));
  await page.getByRole('button', { name: 'Insertar imagen' }).click();
  await page.getByRole('button', { name: 'Desde una URL' }).click();

  await expect.poll(async () => (await estructura(ed)).filter((b) => b)).toEqual(['Arriba', '[img 9]', 'Abajo']);
});

test('Ctrl+X sobre una imagen seleccionada la corta y Ctrl+V la pega en otro lugar', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Antes');
  await page.keyboard.press('Enter');
  await subirImagen(page);
  await page.keyboard.type('Después');

  await clicImagen(page, 1);
  await page.keyboard.press('Control+X');
  await expect(imagen(page, 1)).toHaveCount(0);

  // Pegar al final de "Después"
  await ed.getByText('Después').click();
  await page.keyboard.press('End');
  await page.keyboard.press('Control+V');
  await expect(imagen(page, 1)).toHaveCount(1);
  const bloques = (await estructura(ed)).filter((b) => b);
  expect(bloques.join('|')).toMatch(/Después\s*\|?\s*\[img 1\]|Después\[img 1\]/);
});

test('Ctrl+C sobre una imagen seleccionada la copia', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await subirImagen(page);
  await page.keyboard.type('Texto');

  await clicImagen(page, 1);
  await page.keyboard.press('Control+C');
  await ed.getByText('Texto').click();
  await page.keyboard.press('End');
  await page.keyboard.press('Control+V');

  await expect(imagen(page, 1)).toHaveCount(2);
});

test('cortar una selección con texto e imágenes quita todo y deshacer lo devuelve', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Uno');
  await page.keyboard.press('Enter');
  await subirImagen(page);
  await page.keyboard.type('Dos');

  await page.keyboard.press('Control+A');
  await page.keyboard.press('Control+X');
  await expect(ed.locator('img')).toHaveCount(0);
  await expect(ed).not.toContainText('Uno');

  await page.keyboard.press('Control+Z');
  await expect(imagen(page, 1)).toHaveCount(1);
  await expect(ed).toContainText('Uno');
});

test('Supr borra la imagen seleccionada y el valor del formulario se actualiza', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Hola');
  await subirImagen(page);

  await clicImagen(page, 1);
  await page.keyboard.press('Delete');

  await expect(ed.locator('img')).toHaveCount(0);
  await expect(ed).toContainText('Hola');
});

test('escribir con una imagen seleccionada no la borra sin querer', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Hola');
  await page.keyboard.press('Enter');
  await subirImagen(page);

  await clicImagen(page, 1);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.type('x');

  await expect(imagen(page, 1)).toHaveCount(1);
});

test('varias imágenes a la vez quedan en orden donde estaba el cursor y se sigue escribiendo después', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Antes');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Fin');
  await page.keyboard.press('ArrowUp');

  await (await abrirSelector(page)).setFiles([
    { name: 'a.png', mimeType: 'image/png', buffer: PNG },
    { name: 'b.png', mimeType: 'image/png', buffer: PNG },
  ]);
  await expect(ed.locator('img')).toHaveCount(2);
  await page.keyboard.type('Pie');

  await expect.poll(async () => (await estructura(ed)).filter((b) => b)).toEqual(['Antes', '[img 1][img 2]Pie', 'Fin']);
});

test('si la subida falla se quita el "Subiendo…" y el texto queda intacto', async ({ page }) => {
  await page.route('**/api/fotos/imagenes', (r) => r.fulfill({ status: 500, json: { status: 500, errors: ['falló'], data: null } }));
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Hola mundo');
  await subirImagen(page);
  await page.keyboard.type('!');

  await expect(ed.locator('img')).toHaveCount(0);
  await expect.poll(async () => (await estructura(ed)).filter((b) => b)).toEqual(['Hola mundo!']);
});

test('escribir en el editor vacío y después de Ctrl+A + borrar deja el texto en un párrafo', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Primer texto');
  await expect.poll(() => ed.evaluate((e) => e.innerHTML)).toBe('<p>Primer texto</p>');

  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type('Otro');
  await expect.poll(() => ed.evaluate((e) => Array.from(e.childNodes).every((n) => n.nodeName === 'P'))).toBe(true);
  await expect(ed).toHaveText('Otro');
});

test('el emoji y el enlace van al renglón vacío debajo de una imagen', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Texto');
  await page.keyboard.press('Enter');
  await subirImagen(page);
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Insertar emoji' }).click();
  await page.getByRole('dialog', { name: 'Elegir emoji' }).getByRole('button', { name: '😀' }).click();
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await estructura(ed)).filter((b) => b)).toEqual(['Texto', '[img 1]', '😀']);

  // Como un usuario: toca el renglón donde va el enlace (en el celular la hoja de emojis no devuelve el foco)
  await ed.locator('p').last().click();
  await page.keyboard.press('End');
  await page.keyboard.press('Control+K');
  await page.getByLabel('URL del enlace').fill('taringas.net');
  await page.keyboard.press('Enter');
  await expect(ed.locator('p').last().locator('a')).toHaveAttribute('href', 'https://taringas.net');
  await expect(ed.locator('p').first()).toHaveText('Texto');
});

test('cortar y pegar una imagen conserva el tamaño y la alineación elegidos', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Uno');
  await page.keyboard.press('Enter');
  await subirImagen(page);
  await page.keyboard.type('Dos');

  await clicImagen(page, 1);
  await page.getByRole('button', { name: '50%' }).click();
  await page.getByRole('button', { name: 'Alinear a la derecha' }).click();
  const ancho = await imagen(page, 1).getAttribute('width');
  await clicImagen(page, 1);
  await page.keyboard.press('Control+X');
  await expect(imagen(page, 1)).toHaveCount(0);

  await ed.getByText('Uno').click();
  await page.keyboard.press('End');
  await page.keyboard.press('Control+V');
  await expect(imagen(page, 1)).toHaveAttribute('width', ancho!);
  await expect(ed.locator('.img-resizable.img-der')).toHaveCount(1);
});

test('un video seleccionado se corta con Ctrl+X', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Mirá esto');
  await page.keyboard.press('Enter');
  page.once('dialog', (d) => d.accept('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
  await page.getByRole('button', { name: /YouTube/ }).click();
  const video = ed.locator('figure.video-yt');
  await expect(video).toHaveCount(1);

  await video.click();
  await page.keyboard.press('Control+X');
  await expect(video).toHaveCount(0);
  await page.keyboard.press('Control+Z');
  await expect(video).toHaveCount(1);
});

test('mientras sube la imagen se puede seguir escribiendo en otro lado sin que la imagen se mueva', async ({ page }) => {
  await page.route('**/api/fotos/imagenes', async (r) => {
    await new Promise((ok) => setTimeout(ok, 1200));
    await r.fulfill(ok(`/assets/images/avatar.png?n=${++subidas}`));
  });
  const ed = editor(page);
  await ed.click();
  await page.keyboard.type('Arriba');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Abajo');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('End');

  await (await abrirSelector(page)).setFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });
  // Mientras sube, el cursor va al final de "Abajo" y se escribe
  await ed.getByText('Abajo').click();
  await page.keyboard.press('End');
  await page.keyboard.type(' más');

  await expect(ed.locator('img')).toHaveCount(1);
  await expect.poll(async () => (await estructura(ed)).filter((b) => b)).toEqual(['Arriba[img 1]', 'Abajo más']);
});

test('al bajar en un post largo la barra del editor queda visible debajo de la barra de publicar', async ({ page }) => {
  const ed = editor(page);
  await ed.click();
  for (let i = 0; i < 40; i++) await page.keyboard.press('Enter');
  await page.keyboard.type('Final');
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(300);

  const barra = await page.locator('.cp-bar').boundingBox();
  const toolbar = await page.locator('.rich-editor__toolbar').boundingBox();
  expect(toolbar!.y).toBeGreaterThanOrEqual(barra!.y + barra!.height - 1);
  await expect(page.getByRole('button', { name: 'Insertar imagen' })).toBeInViewport();
});

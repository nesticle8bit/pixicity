import { comprimirImagen } from './comprimir-imagen';

/** PNG de `ancho`x`alto` con ruido (para que pese como una foto real). */
async function png(ancho: number, alto: number): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d')!;
  const datos = ctx.createImageData(ancho, alto);
  for (let i = 0; i < datos.data.length; i++) datos.data[i] = (i * 37) % 255;
  ctx.putImageData(datos, 0, 0);
  const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'));
  return new File([blob], 'captura.png', { type: 'image/png' });
}

async function anchoDe(file: File): Promise<number> {
  const bitmap = await createImageBitmap(file);
  return bitmap.width;
}

describe('comprimirImagen', () => {
  it('reduce a 1080 px de ancho y la pasa a WebP, más liviana', async () => {
    const original = await png(2400, 1200);

    const comprimida = await comprimirImagen(original);

    expect(await anchoDe(comprimida)).toBe(1080);
    expect(comprimida.type).toBe('image/webp');
    expect(comprimida.name).toBe('captura.webp');
    expect(comprimida.size).toBeLessThan(original.size);
  });

  it('no agranda una imagen chica', async () => {
    const comprimida = await comprimirImagen(await png(400, 300));
    expect(await anchoDe(comprimida)).toBe(400);
  });

  it('los GIF pasan tal cual (para no perder la animación)', async () => {
    const gif = new File(['GIF89a'], 'a.gif', { type: 'image/gif' });
    expect(await comprimirImagen(gif)).toBe(gif);
  });

  it('si no se puede decodificar devuelve el original', async () => {
    const roto = new File(['no soy una imagen'], 'x.jpg', { type: 'image/jpeg' });
    expect(await comprimirImagen(roto)).toBe(roto);
  });
});

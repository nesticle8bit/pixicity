/** Ancho máximo de las imágenes de shouts (el API aplica el mismo tope al guardar). */
export const ANCHO_MAX_SHOUT = 1080;

/**
 * Reduce la imagen a `anchoMax` y la recomprime (WebP, o JPEG si el navegador no codifica WebP) antes de subirla:
 * una foto de celular de 4-8 MB queda en unos cientos de KB. El servidor la recomprime igual, esto solo ahorra datos
 * y tiempo de subida. Los GIF se mandan tal cual para no perder la animación (el servidor los convierte a WebP animado).
 * Si algo falla (formato que el navegador no decodifica, sin canvas), devuelve el archivo original.
 */
export async function comprimirImagen(file: File, anchoMax = ANCHO_MAX_SHOUT, calidad = 0.82): Promise<File> {
  if (file.type === 'image/gif' || typeof document === 'undefined' || typeof createImageBitmap !== 'function') {
    return file;
  }

  try {
    // imageOrientation respeta la rotación EXIF de las fotos de celular.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const escala = Math.min(1, anchoMax / bitmap.width);
    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);

    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close?.();

    let blob = await aBlob(canvas, 'image/webp', calidad);
    // Safari viejo: toBlob ignora WebP y devuelve PNG (pesado). Mejor JPEG.
    if (!blob || blob.type !== 'image/webp') blob = await aBlob(canvas, 'image/jpeg', calidad);
    if (!blob) return file;

    // Ya era chica y liviana: recomprimir no ganó nada.
    if (escala === 1 && blob.size >= file.size) return file;

    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const nombre = (file.name.replace(/\.[^.]+$/, '') || 'imagen') + '.' + extension;
    return new File([blob], nombre, { type: blob.type });
  } catch {
    return file;
  }
}

function aBlob(canvas: HTMLCanvasElement, tipo: string, calidad: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), tipo, calidad));
}

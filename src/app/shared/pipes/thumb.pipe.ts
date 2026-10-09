import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

/** Anchos que genera el API en /images/_t/{ancho}/... (ver ThumbnailEndpoints en el backend). */
export const ANCHOS_MINIATURA = [64, 128, 320, 640] as const;

const EXTENSIONES = /\.(jpe?g|png|webp)$/i;

/**
 * URL de la miniatura WebP de una imagen subida al sitio (avatares, fotos, logos de comunidades).
 * `anchoMostrado` es el tamaño en pantalla en px: se pide el doble (pantallas retina) redondeado al ancho
 * disponible más cercano. Imágenes externas, assets propios o formatos no soportados se devuelven sin cambios.
 */
export function thumbUrl(url: string | null | undefined, anchoMostrado: number): string {
  if (!url) {
    return url ?? '';
  }

  const i = url.indexOf('/images/');
  if (i < 0 || url.includes('/images/_t/') || !EXTENSIONES.test(url.split('?')[0])) {
    return url;
  }

  // Solo imágenes servidas por nuestro API: ruta relativa, environment.api o el dominio público.
  const origen = url.slice(0, i);
  if (origen && origen !== environment.api && origen !== environment.publicUrl) {
    return url;
  }

  const deseado = Math.max(1, anchoMostrado) * 2;
  const ancho = ANCHOS_MINIATURA.find((a) => a >= deseado) ?? ANCHOS_MINIATURA[ANCHOS_MINIATURA.length - 1];
  return `${origen}/images/_t/${ancho}/${url.slice(i + '/images/'.length)}`;
}

/** `<img [src]="foto.imageUrl | thumb: 160">` → miniatura WebP del tamaño adecuado. */
@Pipe({ name: 'thumb' })
export class ThumbPipe implements PipeTransform {
  transform(url: string | null | undefined, anchoMostrado: number): string {
    return thumbUrl(url, anchoMostrado);
  }
}

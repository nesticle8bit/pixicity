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

  return `${origen}/images/_t/${anchoMiniatura(anchoMostrado)}/${url.slice(i + '/images/'.length)}`;
}

/** El doble del tamaño en pantalla (retina), redondeado al ancho disponible más cercano. */
function anchoMiniatura(anchoMostrado: number): number {
  const deseado = Math.max(1, anchoMostrado) * 2;
  return ANCHOS_MINIATURA.find((a) => a >= deseado) ?? ANCHOS_MINIATURA[ANCHOS_MINIATURA.length - 1];
}

/**
 * Miniatura de una foto. Las subidas al sitio usan /images/_t como cualquier imagen; las que están en otro sitio
 * (postimg, imgur...) usan /images/_foto/{ancho}/{id}.webp: el API las baja una vez y las reduce (ver
 * MiniaturaFotoEndpoints). Los GIF se dejan como están para no perder la animación.
 */
export function thumbFotoUrl(foto: { id: number; imageUrl: string } | null | undefined, anchoMostrado: number): string {
  const url = foto?.imageUrl ?? '';
  const local = thumbUrl(url, anchoMostrado);
  if (local !== url || !foto?.id || !/^https?:\/\//i.test(url) || /\.gif(\?|$)/i.test(url)) {
    return local;
  }
  // Una URL absoluta de nuestro propio /images/ con formato no soportado (gif, etc.) ya volvió sin cambios arriba.
  if (url.startsWith(`${environment.publicUrl}/images/`) || (environment.api && url.startsWith(`${environment.api}/images/`))) {
    return url;
  }
  return `${environment.api}/images/_foto/${anchoMiniatura(anchoMostrado)}/${foto.id}.webp`;
}

/** `<img [src]="foto.imageUrl | thumb: 160">` → miniatura WebP del tamaño adecuado. */
@Pipe({ name: 'thumb' })
export class ThumbPipe implements PipeTransform {
  transform(url: string | null | undefined, anchoMostrado: number): string {
    return thumbUrl(url, anchoMostrado);
  }
}

/** `<img [src]="foto | thumbFoto: 280">` → miniatura WebP de la foto, también si la imagen es externa. */
@Pipe({ name: 'thumbFoto' })
export class ThumbFotoPipe implements PipeTransform {
  transform(foto: { id: number; imageUrl: string } | null | undefined, anchoMostrado: number): string {
    return thumbFotoUrl(foto, anchoMostrado);
  }
}

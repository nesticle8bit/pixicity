import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SEOService } from './seo.service';

/** "musica-y-videos" → "Musica Y Videos" (para títulos armados desde un slug de la URL). */
export function nombreDesdeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

/**
 * "Título · contexto" (comunidad, autor, sección) solo si entra en los ~60 caracteres que muestra Google;
 * si no, gana el título propio del contenido.
 */
export function sumarContexto(titulo: string, contexto: string | null | undefined, max = 60): string {
  const conContexto = `${titulo} · ${contexto}`;
  return contexto && conContexto.length <= max ? conContexto : titulo;
}

/** `title` de ruta armado con un parámetro (p. ej. `@usuario · Perfil`) mientras la vista carga los datos reales. */
export function tituloConParametro(parametro: string, plantilla: (valor: string) => string): ResolveFn<string> {
  return (route) => plantilla(route.paramMap.get(parametro) ?? '');
}

/** Datos de SEO que una ruta puede declarar en `data` (se heredan de padres a hijos). */
export interface SeoRuta {
  descripcion?: string;
  /** Páginas privadas o sin valor para buscadores (cuenta, mensajes, admin, formularios). */
  noIndex?: boolean;
}

/**
 * Publica el `title` de cada ruta (y su `data.descripcion`/`data.noIndex`) a través de SEOService,
 * así app.component arma title, og:* y robots en un solo lugar. Las vistas con datos (post, perfil,
 * shout...) lo pisan con setSEO cuando cargan.
 */
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private seoService = inject(SEOService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const datos = this.datosDeRuta(snapshot.root);

    this.seoService.setSEOPorDefecto(snapshot.url.split(/[?#]/)[0], {
      title: this.buildTitle(snapshot) ?? '',
      description: datos.descripcion ?? '',
      noIndex: datos.noIndex,
      type: 'website',
      imageURL: '',
      tags: [],
    });
  }

  private datosDeRuta(raiz: ActivatedRouteSnapshot): SeoRuta {
    let datos: SeoRuta = {};
    for (let ruta: ActivatedRouteSnapshot | null = raiz; ruta; ruta = ruta.firstChild) {
      const { descripcion, noIndex } = ruta.data as SeoRuta;
      datos = {
        descripcion: descripcion ?? datos.descripcion,
        noIndex: noIndex ?? datos.noIndex,
      };
    }
    return datos;
  }
}

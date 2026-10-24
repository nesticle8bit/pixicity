import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SEOModel } from 'src/app/models/shared/seo.model';

@Injectable({ providedIn: 'root' })
export class SEOService {
  private SEO = new Subject<SEOModel>();

  /** Último SEO publicado por una vista y la ruta (sin query) donde se publicó. */
  private ultimo: { ruta: string; seo: SEOModel } | null = null;
  private publicadoEnNavegacion = false;
  private rutaActual = '';

  constructor() {}

  setSEO(display: SEOModel): void {
    this.publicadoEnNavegacion = true;
    this.ultimo = { ruta: this.rutaActual, seo: display };
    this.SEO.next(display);
  }

  clearSEO(): void {
    this.SEO.next({
      title: '',
      description: '',
      tags: [],
      type: '',
      imageURL: '',
    });
  }

  getSEO(): Observable<SEOModel> {
    return this.SEO.asObservable();
  }

  /** app.component lo llama en cada NavigationStart. */
  iniciarNavegacion(): void {
    this.publicadoEnNavegacion = false;
  }

  /**
   * SEO de la ruta (title/data de app.routes), lo publica SeoTitleStrategy al terminar cada navegación.
   * Sin esto las vistas que no llaman a setSEO heredaban título, descripción y JSON-LD de la página anterior.
   * La vista lo reemplaza cuando carga sus datos reales.
   */
  setSEOPorDefecto(ruta: string, seo: SEOModel): void {
    this.rutaActual = ruta;

    // Una vista reutilizada que publica en paramMap (p. ej. /posts/:categoria) lo hace antes que la estrategia: gana la vista.
    if (this.publicadoEnNavegacion) {
      if (this.ultimo) {
        this.ultimo.ruta = ruta;
      }
      return;
    }

    // Misma página con otros query params (?page=2, ?tab=): la vista no vuelve a publicar, se repite su SEO.
    if (this.ultimo?.ruta === ruta) {
      this.SEO.next(this.ultimo.seo);
      return;
    }

    this.ultimo = null;
    this.SEO.next(seo);
  }
}

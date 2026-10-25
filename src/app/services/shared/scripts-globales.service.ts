import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from 'src/app/models/api/api-response.model';

interface ScriptsGlobales {
  headerScript?: string | null;
  footerScript?: string | null;
}

/** Marca de lo insertado: el HTML del SSR ya lo trae y el navegador no debe volver a cargarlo. */
const MARCA = 'data-script-global';

/**
 * Inserta los "Scripts globales" del admin (AdSense, analíticas, meta de verificación...) en el <head> y al final
 * del <body>. Antes se guardaban pero nada los ponía en la página. Corre también en el render del servidor: así el
 * código está en el HTML que reciben los rastreadores (AdSense lo busca ahí para verificar el sitio).
 */
@Injectable({ providedIn: 'root' })
export class ScriptsGlobalesService {
  private http = inject(HttpClient);
  private document = inject(DOCUMENT);
  private insertados = false;

  insertar(): void {
    if (this.insertados) return;
    this.insertados = true;

    this.http
      .get<ApiResponse<ScriptsGlobales>>(`${environment.api}/api/configuracion/scripts`)
      .pipe(
        map((r) => (r.status === 200 ? r.data : null)),
        catchError(() => of(null)),
      )
      .subscribe((scripts) => {
        this.agregar(scripts?.headerScript, this.document.head, 'header');
        this.agregar(scripts?.footerScript, this.document.body, 'footer');
      });
  }

  private agregar(html: string | null | undefined, destino: HTMLElement, lugar: 'header' | 'footer'): void {
    if (!html?.trim() || this.document.querySelector(`[${MARCA}="${lugar}"]`)) return;

    const contenedor = this.document.createElement('div');
    contenedor.innerHTML = html;
    for (const nodo of Array.from(contenedor.children)) {
      const copia = nodo.tagName === 'SCRIPT' ? this.script(nodo as HTMLScriptElement) : (nodo.cloneNode(true) as Element);
      // Un <script> que viene dentro de otro elemento tampoco correría: se recrea igual. Array.from y replaceChild
      // porque el DOM del SSR (Domino) no tiene NodeList.forEach ni replaceWith.
      Array.from(copia.querySelectorAll('script')).forEach((s) => s.parentNode?.replaceChild(this.script(s), s));
      copia.setAttribute(MARCA, lugar);
      destino.appendChild(copia);
    }
  }

  /** Un <script> creado con innerHTML queda inerte: solo corre si se crea con createElement. */
  private script(original: HTMLScriptElement): HTMLScriptElement {
    const nuevo = this.document.createElement('script');
    for (const atributo of Array.from(original.attributes)) nuevo.setAttribute(atributo.name, atributo.value);
    nuevo.textContent = original.textContent;
    return nuevo;
  }
}

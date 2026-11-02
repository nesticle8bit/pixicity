import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/** Recuadro que el API manda vacío porque el lector todavía no dio puntos ni comentó (LinksOcultosHelper). */
export const CLASE_LINKS_BLOQUEADOS = 'links-ocultos--bloqueado';

export function tieneLinksBloqueados(html: string | null | undefined): boolean {
  return !!html?.includes(CLASE_LINKS_BLOQUEADOS);
}

/**
 * Pone en cada recuadro bloqueado lo que devolvió GET api/posts/{id}/links-ocultos. Los bloques vienen en orden
 * y solo de los recuadros de más afuera, igual que los cuenta el API.
 */
export function completarLinksOcultos(html: string, bloques: string[]): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const cajas = Array.from(doc.body.querySelectorAll('div.links-ocultos')).filter(
    (c) => !c.parentElement?.closest('div.links-ocultos'),
  );
  cajas.forEach((caja, i) => {
    if (i >= bloques.length || !caja.classList.contains(CLASE_LINKS_BLOQUEADOS)) return;
    caja.innerHTML = bloques[i];
    caja.classList.remove(CLASE_LINKS_BLOQUEADOS);
  });
  return doc.body.innerHTML;
}

/** Avisa a la vista del post que el usuario acaba de darle puntos o comentarlo: ya puede ver los links ocultos. */
@Injectable({ providedIn: 'root' })
export class LinksOcultosService {
  private readonly desbloqueos = new Subject<number>();
  readonly desbloqueo$: Observable<number> = this.desbloqueos.asObservable();

  avisar(postId: number): void {
    this.desbloqueos.next(postId);
  }
}

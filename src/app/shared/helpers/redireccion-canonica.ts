import { inject, Injectable, RESPONSE_INIT } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Lleva a la URL canónica un contenido que se resuelve por id (post, tema, foto) cuando el slug visitado es otro.
 * En el SSR (bots) Angular arma la redirección con el status de RESPONSE_INIT: si queda en 200 sale un 200 vacío
 * con Location, que Google toma como página en blanco. Por eso se marca 301 antes de navegar.
 */
@Injectable({ providedIn: 'root' })
export class RedireccionCanonica {
  private readonly router = inject(Router);
  private readonly respuestaSsr = inject(RESPONSE_INIT, { optional: true });

  ir(url: string): void {
    if (this.respuestaSsr) {
      this.respuestaSsr.status = 301;
    }
    this.router.navigateByUrl(url, { replaceUrl: true });
  }
}

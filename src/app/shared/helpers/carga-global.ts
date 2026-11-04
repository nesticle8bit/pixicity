import { Injectable, signal, untracked } from '@angular/core';

/** Lo mínimo que queda visible: sin esto una respuesta rápida lo hacía parpadear (igual que el minTime de ngx-ui-loader). */
const MINIMO_MS = 300;

/** Contador de peticiones en curso para el loader de pantalla completa (lo alimenta CargaGlobalInterceptor). */
@Injectable({ providedIn: 'root' })
export class CargaGlobal {
  private pendientes = 0;
  private desde = 0;
  private ocultar?: ReturnType<typeof setTimeout>;

  readonly visible = signal(false);

  empezar(): void {
    this.pendientes++;
    clearTimeout(this.ocultar);
    // untracked: una petición lanzada dentro de un effect() no debe quedar suscrita a esta señal. Si no, el effect
    // se vuelve a ejecutar al ocultarse el loader, pide otra vez y el loader no se va nunca (pasó con las medallas).
    if (!untracked(this.visible)) {
      this.desde = Date.now();
      this.visible.set(true);
    }
  }

  terminar(): void {
    this.pendientes = Math.max(0, this.pendientes - 1);
    if (this.pendientes > 0) return;

    const resta = MINIMO_MS - (Date.now() - this.desde);
    this.ocultar = setTimeout(() => this.visible.set(false), Math.max(0, resta));
  }
}

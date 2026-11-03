import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Ir adonde apunta una notificación (toast en vivo y lista de la campana).
 * Si ya estoy en esa página (el mismo post o shout), el router no hace nada con un routerLink normal: acá se
 * recarga la vista para traer lo nuevo (el comentario que avisó) y el #comentario-{id} baja hasta él.
 */
@Injectable({ providedIn: 'root' })
export class IrANotificacionService {
  private readonly router = inject(Router);

  async ir(enlace: string): Promise<void> {
    if (!enlace?.startsWith('/') || enlace.startsWith('//')) return;
    const [ruta, fragmento] = enlace.split('#');
    const actual = this.router.url.split('#')[0].split('?')[0];

    if (ruta.split('?')[0] !== actual) {
      await this.router.navigateByUrl(enlace);
      return;
    }

    // Misma página: se pasa por una ruta vacía sin cambiar la URL y se vuelve, así el componente se crea de nuevo
    // y pide todo otra vez (comentarios incluidos). El hash lo atiende <app-comentarios> al cargar.
    await this.router.navigateByUrl('/', { skipLocationChange: true });
    await this.router.navigateByUrl(fragmento ? `${ruta}#${fragmento}` : ruta);
  }

  /** Para los enlaces de la campana: clic normal pasa por ir(); Ctrl/Cmd/rueda siguen abriendo otra pestaña. */
  alClic(event: MouseEvent, enlace: string | null | undefined): void {
    if (!enlace || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void this.ir(enlace);
  }
}

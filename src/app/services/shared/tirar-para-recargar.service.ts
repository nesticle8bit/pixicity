import { inject, Injectable, NgZone, signal } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy, Router } from '@angular/router';
import { CargaGlobal } from 'src/app/shared/helpers/carga-global';

/** Ancho hasta el que aplica (el mismo corte que el header y el cajón). */
const MOVIL = '(max-width: 767.98px)';
/** Cuánto (px, ya amortiguado) hay que tirar hacia abajo para recargar al soltar. */
export const UMBRAL_TIRAR = 64;
/** Máximo que se espera a que terminen las peticiones de la página recargada antes de soltar el indicador. */
const ESPERA_MAXIMA_MS = 8000;
/** Formularios donde recargar perdería lo escrito: ahí no se tira. */
const SIN_TIRAR = /\/(crear|actualizar|editar)(\/|\?|$)/;

/**
 * Reusa las rutas como siempre, salvo mientras {@link TirarParaRecargarService} recarga: ahí los componentes de la página
 * se vuelven a crear (y piden sus datos de nuevo) sin recargar la app entera.
 */
@Injectable({ providedIn: 'root' })
export class RecargarRutaStrategy extends BaseRouteReuseStrategy {
  recrear = false;

  override shouldReuseRoute(futuro: ActivatedRouteSnapshot, actual: ActivatedRouteSnapshot): boolean {
    return !this.recrear && super.shouldReuseRoute(futuro, actual);
  }
}

/**
 * Deslizar hacia abajo desde el tope recarga la página (celular), en todas las secciones. Por defecto vuelve a crear la
 * ruta actual; una página puede poner su propia recarga con {@link registrar} (/mi suma lo nuevo arriba).
 *
 * Los touch van fuera de la zona: solo se actualizan señales mientras se tira, así el scroll normal no dispara detección
 * de cambios. El refresco nativo del navegador (que recargaría la app entera) se desactiva con overscroll-behavior.
 */
@Injectable({ providedIn: 'root' })
export class TirarParaRecargarService {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly estrategia = inject(RecargarRutaStrategy);
  private readonly carga = inject(CargaGlobal);

  /** Cuánto se tiró (px). */
  readonly tirar = signal(0);
  readonly recargando = signal(false);

  private propia: { recargar: () => Promise<void>; puede?: () => boolean } | null = null;
  private activo = false;

  /** La página actual recarga a su manera mientras esté viva; devuelve con qué quitarla (al destruirse). */
  registrar(recargar: () => Promise<void>, puede?: () => boolean): () => void {
    const propia = { recargar, puede };
    this.propia = propia;
    return () => {
      if (this.propia === propia) this.propia = null;
    };
  }

  /** Una sola vez, desde el AppComponent y solo en el navegador. */
  activar(): void {
    if (this.activo || typeof window === 'undefined') return;
    this.activo = true;
    document.documentElement.style.overscrollBehaviorY = 'contain';

    let inicio: { x: number; y: number } | null = null;
    const alTocar = (e: TouchEvent) => {
      inicio = this.libre(e.target) ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    };
    const alMover = (e: TouchEvent) => {
      if (!inicio) return;
      const dx = e.touches[0].clientX - inicio.x;
      const dy = e.touches[0].clientY - inicio.y;
      // De costado (carruseles, chips): no es tirar en todo este gesto.
      if (this.tirar() === 0 && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        inicio = null;
        return;
      }
      if (dy <= 0 || window.scrollY > 0) {
        if (this.tirar()) this.tirar.set(0);
        return;
      }
      // Amortiguado (la mitad del recorrido) y con tope, como el refresco nativo.
      this.tirar.set(Math.min(dy / 2, UMBRAL_TIRAR + 26));
    };
    const alSoltar = () => {
      if (!inicio) return;
      inicio = null;
      const listo = this.tirar() >= UMBRAL_TIRAR;
      this.tirar.set(0);
      if (listo) this.zone.run(() => void this.recargar());
    };
    this.zone.runOutsideAngular(() => {
      window.addEventListener('touchstart', alTocar, { passive: true });
      window.addEventListener('touchmove', alMover, { passive: true });
      window.addEventListener('touchend', alSoltar, { passive: true });
      window.addEventListener('touchcancel', alSoltar, { passive: true });
    });
  }

  async recargar(): Promise<void> {
    if (this.recargando()) return;
    this.recargando.set(true);
    try {
      await (this.propia ? this.propia.recargar() : this.recargarRuta());
    } finally {
      this.recargando.set(false);
    }
  }

  /** Se puede empezar a tirar: en el tope, sin diálogos ni hojas abiertas, sin escribir y fuera de listas con scroll propio. */
  private libre(objetivo: EventTarget | null): boolean {
    if (window.scrollY > 0 || this.recargando() || !window.matchMedia(MOVIL).matches) return false;
    if (document.documentElement.style.overflow === 'hidden' || document.querySelector('.cdk-overlay-backdrop')) return false;
    if (SIN_TIRAR.test(this.router.url) || (this.propia?.puede && !this.propia.puede())) return false;

    const activo = document.activeElement as HTMLElement | null;
    if (activo && (activo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(activo.tagName))) return false;

    // Dentro de algo que se desplaza solo (chat, cajón): tirar ahí es subir esa lista, no recargar.
    for (let el = objetivo instanceof Element ? objetivo : null; el && el !== document.body; el = el.parentElement) {
      if (el.scrollTop > 0 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) return false;
    }
    return true;
  }

  /** Vuelve a crear los componentes de la ruta actual y espera a que terminen sus peticiones. */
  private async recargarRuta(): Promise<void> {
    this.estrategia.recrear = true;
    try {
      await this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload' });
    } finally {
      this.estrategia.recrear = false;
    }
    const desde = Date.now();
    await new Promise<void>((listo) => {
      const mirar = () => (!this.carga.visible() || Date.now() - desde > ESPERA_MAXIMA_MS ? listo() : setTimeout(mirar, 100));
      setTimeout(mirar, 50);
    });
  }
}

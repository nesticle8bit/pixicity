import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

export interface OpcionesEmojis {
  /** Recibe cada emoji elegido (el selector queda abierto para elegir varios). */
  alElegir: (emoji: string) => void;
  /** Se llama al cerrarse; `porTeclado` = Escape o el mismo botón (conviene devolver el foco al campo). */
  alCerrar?: (porTeclado: boolean) => void;
  /** Si no entra debajo del botón, se ubica por ENCIMA de este elemento en vez de taparlo (p. ej. el textarea). */
  noTapar?: HTMLElement | null;
}

/**
 * Abre el selector de emojis: popover junto al botón en escritorio, bottom sheet en móvil. Uno a la vez; abrirlo
 * desde el mismo botón lo cierra. El componente (y su lista de emojis) se descarga recién al usarlo.
 */
@Injectable({ providedIn: 'root' })
export class EmojisPopoverService {
  private readonly overlay = inject(Overlay);
  private readonly bottomSheet = inject(MatBottomSheet);

  private popover: OverlayRef | null = null;
  private hoja: MatBottomSheetRef | null = null;
  private ancla: HTMLElement | null = null;
  private alCerrar?: (porTeclado: boolean) => void;

  estaAbiertoPara(ancla: HTMLElement): boolean {
    return this.ancla === ancla && (!!this.popover || !!this.hoja);
  }

  async alternar(ancla: HTMLElement, opciones: OpcionesEmojis): Promise<void> {
    const mismo = this.estaAbiertoPara(ancla);
    this.cerrar(mismo);
    if (mismo) return;

    const { BottomSheetsEmojisComponent } = await import('./bottom-sheets-emojis.component');
    this.ancla = ancla;
    this.alCerrar = opciones.alCerrar;

    if (window.matchMedia('(max-width: 599.98px)').matches) {
      const hoja = this.bottomSheet.open(BottomSheetsEmojisComponent, {
        closeOnNavigation: true,
        panelClass: 'emojis-sheet',
        ariaLabel: 'Elegir emoji',
      });
      this.hoja = hoja;
      hoja.instance.elegido.subscribe(opciones.alElegir);
      hoja.instance.cerrar.subscribe(() => this.cerrar(true));
      hoja.afterDismissed().subscribe(() => {
        if (this.hoja === hoja) this.limpiar(false);
      });
      return;
    }

    // Debajo del botón si entra; si no, encima del elemento a no tapar (o del botón).
    const arriba = opciones.noTapar
      ? opciones.noTapar.getBoundingClientRect().top - ancla.getBoundingClientRect().top - 8
      : -6;
    const ref = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(ancla)
        .withPositions([
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
          { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: arriba },
        ])
        .withPush(true)
        .withViewportMargin(8),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    this.popover = ref;
    ref.overlayElement.setAttribute('role', 'dialog');
    ref.overlayElement.setAttribute('aria-label', 'Elegir emoji');

    const picker = ref.attach(new ComponentPortal(BottomSheetsEmojisComponent));
    picker.instance.elegido.subscribe(opciones.alElegir);
    picker.instance.cerrar.subscribe(() => this.cerrar(true));
    ref.backdropClick().subscribe(() => this.cerrar(false));
    // Escape cierra aunque el foco haya vuelto al campo (p. ej. el editor recupera el foco al insertar).
    ref.keydownEvents().subscribe((e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.cerrar(true);
      }
    });
    picker.location.nativeElement.querySelector('.emojis__emoji')?.focus();
  }

  cerrar(porTeclado = false): void {
    if (!this.popover && !this.hoja) return;
    this.popover?.dispose();
    this.hoja?.dismiss();
    this.limpiar(porTeclado);
  }

  private limpiar(porTeclado: boolean): void {
    const alCerrar = this.alCerrar;
    this.popover = null;
    this.hoja = null;
    this.ancla = null;
    this.alCerrar = undefined;
    alCerrar?.(porTeclado);
  }
}

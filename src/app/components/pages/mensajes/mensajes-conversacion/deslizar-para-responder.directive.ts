import { Directive, ElementRef, inject, NgZone, output } from '@angular/core';

/** Lo que hay que arrastrar (px) para que al soltar se responda. */
const UMBRAL = 56;
/** Hasta dónde se deja arrastrar. */
const MAXIMO = 80;
/** Movimiento mínimo (px) antes de decidir si es un deslizamiento o un scroll. */
const ARRANQUE = 10;

/**
 * Deslizar el mensaje a la derecha con el dedo para responderlo (como en WhatsApp). Mientras se arrastra, el host
 * se mueve y `--deslizar` (0 a 1) dice cuánto falta para el umbral, para que el ícono aparezca de a poco.
 * Solo táctil: con mouse se responde con el botón o el clic derecho. Un arrastre vertical sigue siendo scroll.
 */
@Directive({
  selector: '[appDeslizarParaResponder]',
  host: { class: 'deslizable' },
})
export class DeslizarParaResponderDirective {
  readonly deslizado = output<void>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);

  private puntero: number | null = null;
  private x0 = 0;
  private y0 = 0;
  private estado: 'esperando' | 'arrastrando' | 'scroll' = 'esperando';
  private distancia = 0;
  private tragarClic = false;

  constructor() {
    // Fuera de la zona: un pointermove por cuadro no debe disparar la detección de cambios.
    this.zone.runOutsideAngular(() => {
      this.el.addEventListener('pointerdown', (e) => this.alApoyar(e));
      this.el.addEventListener('pointermove', (e) => this.alMover(e));
      this.el.addEventListener('pointerup', (e) => this.alSoltar(e));
      this.el.addEventListener('pointercancel', () => this.reiniciar());
      // Tras un deslizamiento, el clic que sigue no debe abrir un enlace o una imagen del mensaje.
      this.el.addEventListener('click', (e) => {
        if (this.tragarClic) {
          this.tragarClic = false;
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    });
  }

  private alApoyar(e: PointerEvent): void {
    if (e.pointerType !== 'touch' || !e.isPrimary) return;
    // Si el deslizamiento anterior no terminó en clic, este toque es nuevo y no hay nada que tragar.
    this.tragarClic = false;
    this.puntero = e.pointerId;
    this.x0 = e.clientX;
    this.y0 = e.clientY;
    this.estado = 'esperando';
    this.distancia = 0;
  }

  private alMover(e: PointerEvent): void {
    if (e.pointerId !== this.puntero || this.estado === 'scroll') return;
    const dx = e.clientX - this.x0;
    const dy = e.clientY - this.y0;

    if (this.estado === 'esperando') {
      if (Math.abs(dy) > ARRANQUE && Math.abs(dy) > Math.abs(dx)) {
        this.estado = 'scroll';
        return;
      }
      if (dx < ARRANQUE || dx < Math.abs(dy) * 1.5) return;
      this.estado = 'arrastrando';
      this.el.setPointerCapture(e.pointerId);
      this.el.classList.add('is-deslizando');
    }

    const antes = this.distancia;
    // Pasado el umbral cuesta más arrastrar (se siente el tope).
    const d = Math.max(0, dx - ARRANQUE);
    this.distancia = Math.min(MAXIMO, d <= UMBRAL ? d : UMBRAL + (d - UMBRAL) * 0.35);
    this.el.style.transform = `translateX(${this.distancia}px)`;
    this.el.style.setProperty('--deslizar', String(Math.min(1, this.distancia / UMBRAL)));

    if (antes < UMBRAL && this.distancia >= UMBRAL) navigator.vibrate?.(10);
  }

  private alSoltar(e: PointerEvent): void {
    if (e.pointerId !== this.puntero) return;
    const responder = this.estado === 'arrastrando' && this.distancia >= UMBRAL;
    this.tragarClic = this.estado === 'arrastrando';
    this.reiniciar();
    if (responder) this.zone.run(() => this.deslizado.emit());
  }

  private reiniciar(): void {
    this.puntero = null;
    this.estado = 'esperando';
    this.distancia = 0;
    this.el.classList.remove('is-deslizando');
    this.el.style.transform = '';
    this.el.style.removeProperty('--deslizar');
  }
}

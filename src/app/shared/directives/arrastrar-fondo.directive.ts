import { Directive, ElementRef, HostListener, effect, inject, input, model } from '@angular/core';

export interface PosicionFondo {
  x: number;
  y: number;
}

const PASO_TECLADO = 5;

/**
 * Permite reubicar una imagen de fondo (background-size: cover) arrastrándola con mouse o dedo, o con las flechas.
 * La posición es un porcentaje (0–100) por eje, como background-position: el mismo valor sirve para cabeceras de
 * otro tamaño (el perfil público). En el eje en que la imagen no sobra no hay nada que mover.
 *
 *   <div [appArrastrarFondo]="url" [(posicion)]="pos" [style.background-image]="…"
 *        [style.background-position]="pos.x + '% ' + pos.y + '%'"></div>
 */
@Directive({
  selector: '[appArrastrarFondo]',
  host: {
    '[attr.tabindex]': "imagenUrl() ? 0 : null",
    '[attr.aria-label]': "imagenUrl() ? 'Posición del fondo: arrástralo o usa las flechas (Inicio lo centra). Horizontal ' + posicion().x + '%, vertical ' + posicion().y + '%' : null",
    '[class.arrastrar-fondo--activo]': 'arrastrando',
    '[style.cursor]': "imagenUrl() ? (arrastrando ? 'grabbing' : 'grab') : null",
    '[style.touch-action]': "imagenUrl() ? 'none' : null",
  },
})
export class ArrastrarFondoDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** URL de la imagen (sin url(...)). Vacía: no se puede arrastrar. */
  readonly imagenUrl = input<string>('', { alias: 'appArrastrarFondo' });
  readonly posicion = model<PosicionFondo>({ x: 50, y: 50 });

  arrastrando = false;
  private inicio = { px: 0, py: 0, x: 50, y: 50 };
  private natural: { w: number; h: number } | null = null;

  constructor() {
    // Hace falta el tamaño real de la imagen para saber cuánto sobra en cada eje.
    effect(() => {
      const url = this.imagenUrl();
      this.natural = null;
      if (!url || typeof Image === 'undefined') return;
      const img = new Image();
      img.onload = () => {
        if (this.imagenUrl() === url) this.natural = { w: img.naturalWidth, h: img.naturalHeight };
      };
      img.src = url;
    });
  }

  /** Píxeles de imagen que quedan fuera de la caja en cada eje con background-size: cover. */
  private sobrante(): { x: number; y: number } {
    const caja = this.el.nativeElement.getBoundingClientRect();
    if (!this.natural || !caja.width || !caja.height) return { x: 0, y: 0 };
    const escala = Math.max(caja.width / this.natural.w, caja.height / this.natural.h);
    return { x: this.natural.w * escala - caja.width, y: this.natural.h * escala - caja.height };
  }

  @HostListener('pointerdown', ['$event'])
  empezar(evento: PointerEvent): void {
    if (!this.imagenUrl() || evento.button !== 0) return;
    evento.preventDefault();
    this.el.nativeElement.setPointerCapture?.(evento.pointerId);
    this.arrastrando = true;
    const { x, y } = this.posicion();
    this.inicio = { px: evento.clientX, py: evento.clientY, x, y };
  }

  @HostListener('pointermove', ['$event'])
  mover(evento: PointerEvent): void {
    if (!this.arrastrando) return;
    const sobra = this.sobrante();
    // Arrastrar hacia abajo muestra la parte de arriba de la imagen: la posición baja. Así la imagen sigue al dedo.
    const x = sobra.x > 0 ? this.inicio.x - ((evento.clientX - this.inicio.px) / sobra.x) * 100 : this.inicio.x;
    const y = sobra.y > 0 ? this.inicio.y - ((evento.clientY - this.inicio.py) / sobra.y) * 100 : this.inicio.y;
    this.fijar(x, y);
  }

  @HostListener('pointerup', ['$event'])
  @HostListener('pointercancel', ['$event'])
  terminar(evento: PointerEvent): void {
    if (!this.arrastrando) return;
    this.arrastrando = false;
    this.el.nativeElement.releasePointerCapture?.(evento.pointerId);
  }

  @HostListener('keydown', ['$event'])
  teclado(evento: KeyboardEvent): void {
    if (!this.imagenUrl()) return;
    const { x, y } = this.posicion();
    // Igual que arrastrar: la flecha indica hacia dónde se mueve la imagen (abajo = se ve más de arriba).
    const movimientos: Record<string, [number, number]> = {
      ArrowDown: [x, y - PASO_TECLADO],
      ArrowUp: [x, y + PASO_TECLADO],
      ArrowRight: [x - PASO_TECLADO, y],
      ArrowLeft: [x + PASO_TECLADO, y],
      Home: [50, 50],
    };
    const destino = movimientos[evento.key];
    if (!destino) return;
    evento.preventDefault();
    this.fijar(destino[0], destino[1]);
  }

  private fijar(x: number, y: number): void {
    const limitar = (v: number) => Math.round(Math.min(100, Math.max(0, v)));
    const nueva = { x: limitar(x), y: limitar(y) };
    const actual = this.posicion();
    if (nueva.x !== actual.x || nueva.y !== actual.y) this.posicion.set(nueva);
  }
}

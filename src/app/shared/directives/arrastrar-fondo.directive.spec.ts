import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ArrastrarFondoDirective, PosicionFondo } from './arrastrar-fondo.directive';

@Component({
  imports: [ArrastrarFondoDirective],
  template: `<div style="width: 400px; height: 100px" [appArrastrarFondo]="url()" [(posicion)]="posicion"></div>`,
})
class AnfitrionComponent {
  url = signal('');
  posicion: PosicionFondo = { x: 50, y: 50 };
}

describe('ArrastrarFondoDirective', () => {
  function crear(url = 'https://x/fondo.jpg') {
    const fixture = TestBed.createComponent(AnfitrionComponent);
    fixture.componentInstance.url.set(url);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('div');
    const directiva = fixture.debugElement.children[0].injector.get(ArrastrarFondoDirective);
    return { fixture, el, directiva };
  }

  const puntero = (tipo: string, x: number, y: number) =>
    new PointerEvent(tipo, { clientX: x, clientY: y, button: 0, pointerId: 1, bubbles: true });

  it('arrastrar hacia abajo muestra la parte de arriba (la imagen sigue al puntero) y no pasa de los bordes', () => {
    const { fixture, el, directiva } = crear();
    // Imagen 400x400 en una caja de 400x100 con cover: sobran 300px en vertical y nada en horizontal.
    (directiva as unknown as { natural: { w: number; h: number } }).natural = { w: 400, h: 400 };

    el.dispatchEvent(puntero('pointerdown', 100, 100));
    el.dispatchEvent(puntero('pointermove', 180, 130)); // 30px abajo = 10% de lo que sobra
    expect(fixture.componentInstance.posicion).toEqual({ x: 50, y: 40 }); // en x no sobra: no se mueve

    el.dispatchEvent(puntero('pointermove', 100, 1000));
    expect(fixture.componentInstance.posicion.y).toBe(0);
    el.dispatchEvent(puntero('pointerup', 100, 1000));
  });

  it('con teclado: la flecha indica hacia dónde va la imagen e Inicio la centra', () => {
    const { fixture, el } = crear();

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(fixture.componentInstance.posicion).toEqual({ x: 50, y: 45 });

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(fixture.componentInstance.posicion).toEqual({ x: 50, y: 50 });
  });

  it('sin imagen no se puede arrastrar ni enfocar', () => {
    const { fixture, el } = crear('');

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(fixture.componentInstance.posicion).toEqual({ x: 50, y: 50 });
    expect(el.hasAttribute('tabindex')).toBeFalse();
  });
});

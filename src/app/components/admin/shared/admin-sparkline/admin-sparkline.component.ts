import { Component, Input, input } from '@angular/core';

/**
 * Sparkline SVG sin dependencias: dibuja una serie corta como área + línea.
 * El viewBox es fijo (100x30) y el SVG escala al ancho del contenedor.
 */
@Component({
    selector: 'app-admin-sparkline',
    templateUrl: './admin-sparkline.component.html',
    styleUrls: ['./admin-sparkline.component.scss'],
})
export class AdminSparklineComponent {
  private static uid = 0;

  private _valores: number[] = [];

  public readonly gradientId = `spark-grad-${AdminSparklineComponent.uid++}`;
  public linea = '';
  public area = '';
  public ultimoX = 0;
  public ultimoY = 0;

  readonly color = input('#0B6EA5');
  readonly alto = input(40);

  @Input()
  set valores(value: number[] | null | undefined) {
    this._valores = value?.length ? value : [];
    this.construir();
  }
  get valores(): number[] {
    return this._valores;
  }

  get vacio(): boolean {
    return this._valores.length < 2;
  }

  private construir(): void {
    if (this.vacio) {
      this.linea = '';
      this.area = '';
      return;
    }

    const max = Math.max(...this._valores);
    const min = Math.min(...this._valores);
    // Rango 0 (serie plana) produciría división por cero: la dibujamos a media altura.
    const rango = max - min || 1;
    const pasoX = 100 / (this._valores.length - 1);

    const puntos = this._valores.map((v, i) => {
      const x = i * pasoX;
      const y = max === min ? 15 : 28 - ((v - min) / rango) * 26;
      return { x, y };
    });

    this.linea = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    this.area = `${this.linea} L100,30 L0,30 Z`;

    const ultimo = puntos[puntos.length - 1];
    this.ultimoX = ultimo.x;
    this.ultimoY = ultimo.y;
  }
}

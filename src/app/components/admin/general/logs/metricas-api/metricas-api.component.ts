import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MetricaRuta, MetricasApi } from 'src/app/models/admin/dashboard.model';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';

/**
 * Rendimiento del API en vivo (en memoria, desde el último reinicio): peticiones/min, tasa de 5xx, latencias y
 * los endpoints más lentos o con errores. Las alertas por webhook (salud y tasa de errores) las manda el API.
 */
@Component({
  selector: 'app-metricas-api',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, PercentPipe],
  templateUrl: './metricas-api.component.html',
  styleUrls: ['./metricas-api.component.scss'],
})
export class MetricasApiComponent implements OnInit {
  private generalService = inject(IHttpGeneralService);
  private readonly destroyRef = inject(DestroyRef);

  readonly ventanas = [15, 60];
  readonly minutos = signal(15);
  readonly metricas = signal<MetricasApi | null>(null);
  readonly cargando = signal(false);

  /** p95 a partir del cual una ruta se marca como lenta (igual criterio que el log de "petición lenta" del API). */
  readonly umbralLentoMs = 2000;

  ngOnInit(): void {
    this.cargar();
  }

  cambiarVentana(minutos: number): void {
    if (this.minutos() === minutos) return;
    this.minutos.set(minutos);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.generalService
      .getMetricasApi(this.minutos())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (m) => {
          this.metricas.set(m);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  trackRuta(_: number, r: MetricaRuta): string {
    return r.ruta;
  }
}

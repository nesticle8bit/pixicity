import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TirarParaRecargarService, UMBRAL_TIRAR } from 'src/app/services/shared/tirar-para-recargar.service';

/** Indicador de deslizar para recargar (celular): crece con el dedo arriba de la página y gira mientras recarga. */
@Component({
  selector: 'app-tirar-para-recargar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = servicio.tirar();
    @let recargando = servicio.recargando();
    @if (t > 0 || recargando) {
      <div class="tirar" [class.is-listo]="t >= umbral" [class.is-recargando]="recargando"
        [style.height.px]="recargando ? 48 : t" aria-hidden="true">
        <i class="ti ti-refresh" [style.transform]="recargando ? null : 'rotate(' + t * 4 + 'deg)'"></i>
      </div>
    }
    @if (recargando) {
      <span class="visually-hidden" role="status">Recargando…</span>
    }
  `,
  styles: `
    .tirar {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: light-dark(#006595, #1e99d3);
      transition: height 0.12s ease-out;

      i {
        font-size: 1.5rem;
        opacity: 0.45;
      }

      &.is-listo i,
      &.is-recargando i {
        opacity: 1;
      }

      &.is-recargando i {
        animation: tirar-girar 0.8s linear infinite;
      }
    }

    @keyframes tirar-girar {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class TirarParaRecargarComponent {
  readonly servicio = inject(TirarParaRecargarService);
  readonly umbral = UMBRAL_TIRAR;
}

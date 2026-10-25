import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CargaGlobal } from 'src/app/shared/helpers/carga-global';

/**
 * Loader de pantalla completa de las peticiones que no están en SIN_LOADER. Reemplaza a ngx-ui-loader (52 KB en el
 * arranque) con el mismo aspecto: velo azul oscuro, pulso y barra de progreso arriba.
 */
@Component({
  selector: 'app-carga-global',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="carga-global" [class.visible]="carga.visible()" [attr.aria-hidden]="!carga.visible()">
      @if (carga.visible()) {
        <div class="carga-global__barra"></div>
        <div class="carga-global__pulso" role="progressbar" aria-label="Cargando"></div>
      }
    </div>
  `,
  styles: `
    .carga-global {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgb(18 36 58 / 80%);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity .3s, visibility .3s;
    }

    .carga-global.visible {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .carga-global__pulso {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #137eff;
      animation: carga-pulso 1s infinite ease-in-out;
    }

    .carga-global__barra {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: #137eff;
      transform-origin: left;
      animation: carga-barra 4s cubic-bezier(.1, .7, .3, 1) forwards;
    }

    @keyframes carga-pulso {
      from { transform: scale(0); opacity: 1; }
      to { transform: scale(1); opacity: 0; }
    }

    @keyframes carga-barra {
      from { transform: scaleX(0); }
      to { transform: scaleX(.9); }
    }
  `,
})
export class CargaGlobalComponent {
  protected readonly carga = inject(CargaGlobal);
}

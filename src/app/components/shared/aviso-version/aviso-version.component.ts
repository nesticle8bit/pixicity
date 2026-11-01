import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AppInstalableService } from 'src/app/services/shared/app-instalable.service';

/**
 * "Hay una versión nueva": aparece cuando se publicó un deploy mientras la app (o la pestaña) seguía abierta.
 * Si no se toca, la próxima navegación ya carga la versión nueva sola (ver AppInstalableService).
 */
@Component({
  selector: 'app-aviso-version',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (app.versionNueva() && !descartado()) {
    <div class="aviso-version" role="status">
      <i class="ti ti-sparkles" aria-hidden="true"></i>
      <span class="aviso-version__texto">Hay una versión nueva de Taringas!</span>
      <button type="button" class="aviso-version__actualizar" (click)="app.recargar()">Actualizar</button>
      <button type="button" class="aviso-version__cerrar" (click)="descartado.set(true)" aria-label="Más tarde">
        <i class="ti ti-x" aria-hidden="true"></i>
      </button>
    </div>
    }
  `,
  styles: `
    .aviso-version {
      position: fixed;
      left: 50%;
      bottom: calc(16px + env(safe-area-inset-bottom));
      z-index: 1060;
      display: flex;
      align-items: center;
      gap: 10px;
      width: max-content;
      max-width: calc(100vw - 24px);
      padding: 8px 8px 8px 16px;
      border-radius: 999px;
      background: light-dark(#14202a, #f1f3f5);
      box-shadow: 0 8px 24px rgb(0 0 0 / 25%);
      color: light-dark(#fff, #14202a);
      font-size: 0.9rem;
      transform: translateX(-50%);
      animation: aviso-version-entrar 0.25s ease-out;
    }

    .aviso-version__texto {
      flex: 1;
      min-width: 0;
    }

    .aviso-version__actualizar {
      min-height: 36px;
      padding: 0 14px;
      border: 0;
      border-radius: 999px;
      background: #1e99d3;
      color: #fff;
      font: inherit;
      font-weight: 700;
    }

    .aviso-version__cerrar {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: inherit;
      font-size: 1.1rem;
    }

    button:focus-visible {
      outline: 2px solid #1e99d3;
      outline-offset: 2px;
    }

    @keyframes aviso-version-entrar {
      from {
        opacity: 0;
        transform: translate(-50%, 12px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .aviso-version {
        animation: none;
      }
    }
  `,
})
export class AvisoVersionComponent {
  readonly app = inject(AppInstalableService);
  readonly descartado = signal(false);
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface VisorImagenData {
  url: string;
  alt?: string;
}

/**
 * Imagen a pantalla completa dentro de la plataforma: fondo negro, la imagen centrada (sin recortar) y una ✕ arriba a
 * la derecha. Cierra con la ✕, con Esc o tocando el fondo. Se abre con VisorImagenService.
 */
@Component({
  selector: 'app-visor-imagen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="visor" (click)="cerrar()">
      <button type="button" class="visor__cerrar" (click)="cerrar(); $event.stopPropagation()" aria-label="Cerrar imagen"
        cdkFocusInitial>
        <i class="ti ti-x" aria-hidden="true"></i>
      </button>

      @if (!cargada() && !fallo()) {
        <span class="visor__cargando" role="status"><i class="ti ti-loader-2" aria-hidden="true"></i><span class="visually-hidden">Cargando imagen</span></span>
      }
      @if (fallo()) {
        <p class="visor__error" role="alert">No se pudo cargar la imagen.</p>
      }

      <img class="visor__img" [class.is-cargada]="cargada()" [src]="data.url" [alt]="data.alt || 'Imagen'"
        (load)="cargada.set(true)" (error)="fallo.set(true)" (click)="$event.stopPropagation()" />
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .visor {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 56px 16px 16px;
      box-sizing: border-box;
      background: #000;
      cursor: zoom-out;
    }

    .visor__img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      opacity: 0;
      transition: opacity 0.2s ease;
      cursor: default;
      user-select: none;

      &.is-cargada {
        opacity: 1;
      }
    }

    .visor__cerrar {
      position: absolute;
      top: max(12px, env(safe-area-inset-top));
      right: 12px;
      z-index: 1;
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border: 0;
      border-radius: 50%;
      background: rgb(255 255 255 / 14%);
      font-size: 1.5rem;
      color: #fff;
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background: rgb(255 255 255 / 26%);
      }

      &:focus-visible {
        outline: 2px solid #fff;
        outline-offset: 2px;
      }
    }

    .visor__cargando {
      position: absolute;
      font-size: 2rem;
      color: #fff;

      i {
        display: inline-block;
        animation: visor-girar 1s linear infinite;
      }
    }

    .visor__error {
      position: absolute;
      margin: 0;
      color: #fff;
    }

    @keyframes visor-girar {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .visor__img {
        transition: none;
      }

      .visor__cargando i {
        animation: none;
      }
    }
  `,
})
export class VisorImagenComponent {
  readonly data = inject<VisorImagenData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<VisorImagenComponent>);

  readonly cargada = signal(false);
  readonly fallo = signal(false);

  cerrar(): void {
    this.ref.close();
  }
}

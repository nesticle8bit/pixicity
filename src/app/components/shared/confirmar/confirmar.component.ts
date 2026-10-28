import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ConfirmarService } from 'src/app/services/shared/confirmar.service';

/**
 * Diálogo de confirmación (y de pedir un texto) del ConfirmarService. Va una sola vez en app.component.
 * Escape o un clic en el fondo cancelan; Enter acepta (en el área de varias líneas, Ctrl+Enter). Al cerrar
 * devuelve el foco al elemento que lo abrió.
 */
@Component({
  selector: 'app-confirmar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (servicio.actual(); as p) {
    <div class="confirmar-fondo" (click)="cancelar()"></div>
    <div class="confirmar" [class.confirmar--peligro]="p.peligro" role="alertdialog" aria-modal="true"
      aria-labelledby="confirmar-titulo" aria-describedby="confirmar-mensaje" (keydown)="tecla($event)">
      <div class="confirmar__cabecera">
        <span class="confirmar__icono" aria-hidden="true">
          <i class="ti" [class.ti-alert-triangle]="p.peligro" [class.ti-info-circle]="!p.peligro"></i>
        </span>
        <h2 id="confirmar-titulo" class="confirmar__titulo">{{ p.titulo || (p.conTexto ? 'Escribe una respuesta' : 'Confirmar') }}</h2>
        <button type="button" class="confirmar__cerrar" aria-label="Cerrar" (click)="cancelar()">
          <i class="ti ti-x" aria-hidden="true"></i>
        </button>
      </div>

      <p id="confirmar-mensaje" class="confirmar__mensaje">{{ p.mensaje }}</p>

      @if (p.conTexto) {
        @if (p.multilinea) {
        <textarea #campo class="confirmar__campo" rows="3" [placeholder]="p.placeholder ?? ''" [value]="texto()"
          (input)="texto.set($any($event.target).value)" aria-labelledby="confirmar-mensaje"></textarea>
        } @else {
        <input #campo class="confirmar__campo" type="text" [placeholder]="p.placeholder ?? ''" [value]="texto()"
          (input)="texto.set($any($event.target).value)" aria-labelledby="confirmar-mensaje" />
        }
      }

      <div class="confirmar__acciones">
        <button #botonCancelar type="button" class="confirmar__boton" (click)="cancelar()">{{ p.cancelar || 'Cancelar' }}</button>
        <button #botonAceptar type="button" class="confirmar__boton confirmar__boton--principal"
          [disabled]="p.conTexto && p.requerido && !texto().trim()" (click)="aceptar()">
          {{ p.aceptar || 'Aceptar' }}
        </button>
      </div>
    </div>
    }
  `,
  styles: `
    .confirmar-fondo {
      position: fixed;
      inset: 0;
      z-index: 1200;
      background: rgb(16 24 40 / 45%);
      animation: confirmar-aparece 0.12s ease-out;
    }

    .confirmar {
      --confirmar-color: light-dark(#0b6ea5, #2ba0e1);
      position: fixed;
      top: 50%;
      left: 50%;
      z-index: 1201;
      width: 420px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 32px);
      overflow: auto;
      padding: 20px;
      border-top: 4px solid var(--confirmar-color);
      border-radius: 10px;
      background: light-dark(#fff, #1e2124);
      box-shadow: 0 20px 48px rgb(16 24 40 / 22%), 0 4px 10px rgb(16 24 40 / 10%);
      color: light-dark(#3d4852, #c2c2c2);
      transform: translate(-50%, -50%);
      animation: confirmar-entra 0.15s ease-out;
    }

    .confirmar--peligro {
      --confirmar-color: light-dark(#c0392b, #dc6c61);
    }

    .confirmar__cabecera {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .confirmar__icono {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--confirmar-color) 12%, light-dark(#fff, #1e2124));
      color: var(--confirmar-color);
      font-size: 19px;
    }

    .confirmar__titulo {
      flex: 1;
      margin: 0;
      color: light-dark(#1f2933, #cad5df);
      font-size: 16px;
      font-weight: 700;
    }

    .confirmar__cerrar {
      position: relative;
      border: 0;
      background: none;
      color: light-dark(#7b8794, #9c9c9c);
      font-size: 18px;
      line-height: 1;
      cursor: pointer;

      &::after {
        content: '';
        position: absolute;
        inset: -12px;
      }

      &:hover {
        color: light-dark(#1f2933, #cad5df);
      }
    }

    .confirmar__mensaje {
      margin: 0 0 16px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-line;
      overflow-wrap: anywhere;
    }

    .confirmar__campo {
      display: block;
      width: 100%;
      margin: -4px 0 16px;
      padding: 8px 10px;
      border: 1px solid light-dark(#cbd2d9, #46535f);
      border-radius: 6px;
      font: inherit;
      font-size: 14px;
      resize: vertical;

      &:focus {
        border-color: #0b6ea5;
        outline: 2px solid rgb(11 110 165 / 20%);
      }
    }

    .confirmar__acciones {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }

    .confirmar__boton {
      min-height: 36px;
      padding: 0 16px;
      border: 1px solid light-dark(#cbd2d9, #46535f);
      border-radius: 6px;
      background: light-dark(#fff, #1e2124);
      color: light-dark(#3d4852, #c2c2c2);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: light-dark(#f5f7fa, #1f2b3d);
      }

      &:focus-visible {
        outline: 2px solid var(--confirmar-color);
        outline-offset: 2px;
      }
    }

    .confirmar__boton--principal {
      border-color: var(--confirmar-color);
      background: var(--confirmar-color);
      color: #fff;

      &:hover {
        background: color-mix(in srgb, var(--confirmar-color) 85%, #000);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    @media (max-width: 480px) {
      .confirmar__acciones {
        flex-direction: column-reverse;
      }

      .confirmar__boton {
        width: 100%;
        min-height: 44px;
      }
    }

    @keyframes confirmar-aparece {
      from { opacity: 0; }
    }

    @keyframes confirmar-entra {
      from { opacity: 0; transform: translate(-50%, -46%); }
    }

    @media (prefers-reduced-motion: reduce) {
      .confirmar,
      .confirmar-fondo {
        animation: none;
      }
    }
  `,
})
export class ConfirmarComponent {
  protected readonly servicio = inject(ConfirmarService);
  private readonly documento = inject(DOCUMENT);
  protected readonly texto = signal('');

  private readonly campo = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('campo');
  private readonly botonAceptar = viewChild<ElementRef<HTMLButtonElement>>('botonAceptar');
  private readonly botonCancelar = viewChild<ElementRef<HTMLButtonElement>>('botonCancelar');
  private focoPrevio: HTMLElement | null = null;

  constructor() {
    // Cada pedido nuevo: reinicia el texto y enfoca el campo, o Cancelar si es peligroso (Enter por accidente no borra).
    effect(() => {
      const pedido = this.servicio.actual();
      if (!pedido) return;
      this.focoPrevio ??= this.documento.activeElement as HTMLElement | null;
      this.texto.set(pedido.valor ?? '');
      queueMicrotask(() => {
        const destino = pedido.conTexto ? this.campo() : pedido.peligro ? this.botonCancelar() : this.botonAceptar();
        destino?.nativeElement.focus();
      });
    });
  }

  protected aceptar(): void {
    const pedido = this.servicio.actual();
    if (!pedido) return;
    const valor = this.texto().trim();
    if (pedido.conTexto && pedido.requerido && !valor) return;
    this.cerrar(pedido.conTexto ? valor : '');
  }

  protected cancelar(): void {
    this.cerrar(null);
  }

  protected tecla(evento: KeyboardEvent): void {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      this.cancelar();
    } else if (evento.key === 'Enter' && evento.target === this.campo()?.nativeElement) {
      if (this.servicio.actual()?.multilinea && !evento.ctrlKey && !evento.metaKey) return;
      evento.preventDefault();
      this.aceptar();
    } else if (evento.key === 'Tab') {
      this.atraparFoco(evento);
    }
  }

  private cerrar(valor: string | null): void {
    this.servicio.responder(valor);
    // Si queda otro pedido en cola, el foco lo toma ese diálogo.
    if (!this.servicio.actual()) {
      this.focoPrevio?.focus?.();
      this.focoPrevio = null;
    }
  }

  /** Tab no sale del diálogo mientras está abierto. */
  private atraparFoco(evento: KeyboardEvent): void {
    const dialogo = (evento.currentTarget as HTMLElement);
    const enfocables = Array.from(dialogo.querySelectorAll<HTMLElement>('button:not([disabled]), input, textarea'));
    if (!enfocables.length) return;
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    if (evento.shiftKey && this.documento.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && this.documento.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  }
}

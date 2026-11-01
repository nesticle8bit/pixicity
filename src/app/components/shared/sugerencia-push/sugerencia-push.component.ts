import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NotificacionesEscritorioService } from 'src/app/services/shared/notificaciones-escritorio.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

const CLAVE_DESCARTADA = 'push-sugerencia-descartada';

function descartadaAntes(): boolean {
  try {
    return localStorage.getItem(CLAVE_DESCARTADA) === '1';
  } catch {
    return false;
  }
}

/**
 * "Activar notificaciones de escritorio": solo si este dispositivo puede y el usuario todavía no respondió al permiso.
 * Se descarta para siempre con la X (queda el interruptor de /cuenta → Notificaciones).
 */
@Component({
  selector: 'app-sugerencia-push',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="sp" role="group" aria-label="Notificaciones de escritorio">
        <i class="ti ti-bell-ringing sp__icono" aria-hidden="true"></i>
        <span class="sp__texto">Entérate de tus mensajes y avisos aunque no tengas Taringas! abierto.</span>
        <button type="button" class="sp__activar" [disabled]="push.ocupado()" (click)="activar($event)">Activar</button>
        <button type="button" class="sp__cerrar" (click)="descartar($event)" aria-label="No, gracias">
          <i class="ti ti-x" aria-hidden="true"></i>
        </button>
      </div>
    }
  `,
  styles: `
    .sp {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 6px 8px 10px;
      border-radius: 10px;
      background: light-dark(#eaf4fb, #1d2a35);
      color: light-dark(#26323a, #c7d2da);
      font-size: 0.8rem;
      line-height: 1.3;
    }

    .sp__icono {
      flex-shrink: 0;
      color: #005bb3;
      font-size: 1.1rem;
    }

    .sp__texto {
      flex: 1;
      min-width: 0;
    }

    .sp__activar {
      flex-shrink: 0;
      min-height: 32px;
      padding: 0 12px;
      border: 0;
      border-radius: 999px;
      background: #005bb3;
      color: #fff;
      font-weight: 700;
      font-size: 0.8rem;
    }

    .sp__cerrar {
      display: grid;
      flex-shrink: 0;
      place-items: center;
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: inherit;
    }

    button:focus-visible {
      outline: 2px solid #1e99d3;
      outline-offset: 2px;
    }
  `,
})
export class SugerenciaPushComponent {
  readonly push = inject(NotificacionesEscritorioService);
  private readonly notificaciones = inject(NotificationService);
  private readonly descartada = signal(descartadaAntes());

  visible(): boolean {
    return !this.descartada() && this.push.estado() === 'inactivo' && typeof Notification !== 'undefined' && Notification.permission === 'default';
  }

  async activar(e: Event): Promise<void> {
    // Dentro de los desplegables: que el clic no los cierre.
    e.stopPropagation();
    if (await this.push.activar()) this.notificaciones.success('Te avisaremos en este dispositivo', 'Notificaciones');
  }

  descartar(e: Event): void {
    e.stopPropagation();
    this.descartada.set(true);
    try {
      localStorage.setItem(CLAVE_DESCARTADA, '1');
    } catch {
      // Sin almacenamiento: vuelve a aparecer en la próxima visita.
    }
  }
}

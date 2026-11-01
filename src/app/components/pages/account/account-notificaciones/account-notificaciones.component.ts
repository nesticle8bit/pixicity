import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { NotificacionesEscritorioService } from 'src/app/services/shared/notificaciones-escritorio.service';

/** Texto de cada tipo de aviso (TipoMonitor del API), agrupados como los ve el usuario. */
const TIPOS: { grupo: string; tipos: { tipo: string; label: string; detalle: string }[] }[] = [
  {
    grupo: 'Conversaciones',
    tipos: [
      { tipo: 'Comentario', label: 'Comentarios', detalle: 'Alguien comenta tu post o tu shout' },
      { tipo: 'Respuestas', label: 'Respuestas', detalle: 'Alguien responde uno de tus comentarios' },
      { tipo: 'Mencion', label: 'Menciones', detalle: 'Alguien te menciona con @' },
      { tipo: 'Shout', label: 'Muro', detalle: 'Alguien escribe en tu muro' },
    ],
  },
  {
    grupo: 'Reacciones',
    tipos: [
      { tipo: 'Like', label: 'Me gusta', detalle: 'A alguien le gusta tu shout' },
      { tipo: 'Reshout', label: 'Compartidos', detalle: 'Alguien comparte tu shout' },
      { tipo: 'Puntos', label: 'Puntos', detalle: 'Alguien deja puntos en tu post' },
      { tipo: 'Favoritos', label: 'Favoritos', detalle: 'Alguien guarda tu post en favoritos' },
      { tipo: 'Recomendacion', label: 'Recomendaciones', detalle: 'Alguien recomienda tu post' },
    ],
  },
  {
    grupo: 'Comunidades',
    tipos: [
      { tipo: 'ComunidadMiembro', label: 'Miembros', detalle: 'Alguien se une o sigue a una comunidad que administras' },
      { tipo: 'ComunidadTema', label: 'Temas nuevos', detalle: 'Se crea un tema en una comunidad que administras' },
      { tipo: 'ComunidadRespuesta', label: 'Respuestas', detalle: 'Comentan tu tema o responden tu comentario' },
      { tipo: 'ComunidadVoto', label: 'Votos', detalle: 'Votan positivo tu tema o tu comentario' },
    ],
  },
  {
    grupo: 'Gente y posts que sigues',
    tipos: [
      { tipo: 'Seguir', label: 'Nuevos seguidores', detalle: 'Alguien empieza a seguirte' },
      { tipo: 'PostNuevoUsuarioQueSigues', label: 'Posts nuevos', detalle: 'Alguien que sigues publica un post' },
      { tipo: 'ComentarioSiguePost', label: 'Posts que sigues', detalle: 'Hay comentarios nuevos en un post que sigues' },
    ],
  },
];

/**
 * /cuenta → Notificaciones: notificaciones de escritorio de este dispositivo y qué avisos llegan a la campana.
 * Cada cambio se guarda al instante.
 */
@Component({
  selector: 'app-account-notificaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSlideToggle],
  template: `
    <section class="nt">
      @let estado = push.estado();
      @if (estado !== 'sin-servidor' && estado !== 'cargando') {
        <h3 class="nt__grupo nt__grupo--primero" id="nt-escritorio">Notificaciones de escritorio</h3>
        <div class="nt__push" role="group" aria-labelledby="nt-escritorio">
          <p class="nt__detalle nt__push-intro">
            Mensajes y avisos en la pantalla de este dispositivo (computadora o celular), aunque no tengas Taringas! abierto.
          </p>
          @switch (estado) {
            @case ('activo') {
              <ul class="nt__lista">
                <li class="nt__item">
                  <span>
                    <span class="nt__label" id="nt-push-mensajes">Mensajes privados</span>
                    <span class="nt__detalle">Cuando alguien te escribe (salvo conversaciones silenciadas)</span>
                  </span>
                  <mat-slide-toggle [checked]="push.preferencias().mensajes" [disabled]="push.ocupado()"
                    aria-labelledby="nt-push-mensajes" (change)="cambiarPush('mensajes', $event.checked)" />
                </li>
                <li class="nt__item">
                  <span>
                    <span class="nt__label" id="nt-push-campana">Notificaciones</span>
                    <span class="nt__detalle">Lo que llega a la campana, según los tipos que tengas activos abajo</span>
                  </span>
                  <mat-slide-toggle [checked]="push.preferencias().notificaciones" [disabled]="push.ocupado()"
                    aria-labelledby="nt-push-campana" (change)="cambiarPush('notificaciones', $event.checked)" />
                </li>
              </ul>
              <button type="button" class="nt__push-boton nt__push-boton--secundario" [disabled]="push.ocupado()" (click)="desactivarPush()">
                <i class="ti ti-bell-off" aria-hidden="true"></i> Desactivar en este dispositivo
              </button>
            }
            @case ('inactivo') {
              <button type="button" class="nt__push-boton" [disabled]="push.ocupado()" (click)="activarPush()">
                <i class="ti ti-bell-ringing" aria-hidden="true"></i> Activar en este dispositivo
              </button>
            }
            @case ('bloqueado') {
              <p class="nt__push-nota" role="status">
                <i class="ti ti-lock" aria-hidden="true"></i>
                Las bloqueaste en este navegador. Para recibirlas, toca el candado junto a la dirección del sitio,
                permite las <b>Notificaciones</b> y recarga la página.
              </p>
            }
            @case ('ios-instalar') {
              <p class="nt__push-nota">
                <i class="ti ti-device-mobile" aria-hidden="true"></i>
                En iPhone llegan solo con la app instalada: en Safari toca <b>Compartir</b> → <b>Agregar a inicio</b>,
                ábrela desde el ícono y vuelve acá.
              </p>
            }
            @default {
              <p class="nt__push-nota">
                <i class="ti ti-info-circle" aria-hidden="true"></i>
                Este navegador no permite notificaciones de escritorio. Prueba con Chrome, Edge, Firefox o Safari al día.
              </p>
            }
          }
        </div>
      }

      <h3 class="nt__grupo">Qué avisos recibir</h3>
      <p class="nt__intro">Elige qué avisos quieres recibir. Los cambios se guardan solos.</p>
      @for (g of grupos; track g.grupo) {
        <h3 class="nt__grupo">{{ g.grupo }}</h3>
        <ul class="nt__lista">
          @for (t of g.tipos; track t.tipo) {
            <li class="nt__item">
              <span>
                <span class="nt__label" [id]="'nt-' + t.tipo">{{ t.label }}</span>
                <span class="nt__detalle">{{ t.detalle }}</span>
              </span>
              <mat-slide-toggle [checked]="activo(t.tipo)" [disabled]="guardando() === t.tipo"
                [attr.aria-labelledby]="'nt-' + t.tipo" (change)="cambiar(t.tipo, $event.checked)" />
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .nt { max-width: 560px; padding: 16px 4px; }
    .nt__intro { margin: 0 0 8px; font-size: 0.88rem; color: light-dark(#5d6b75, #aeaeae); }
    .nt__grupo--primero { margin-top: 0 !important; }
    .nt__push { margin-bottom: 8px; }
    .nt__push-intro { margin: 0 0 10px; font-size: 0.85rem !important; }
    .nt__push-boton {
      display: inline-flex; align-items: center; gap: 6px; min-height: 40px; margin-top: 10px; padding: 0 16px;
      border: 0; border-radius: 999px; background: #005bb3; color: #fff; font-weight: 700; font-size: 0.88rem;
      &:disabled { opacity: 0.6; }
      &:focus-visible { outline: 2px solid #1e99d3; outline-offset: 2px; }
    }
    .nt__push-boton--secundario {
      background: transparent; color: light-dark(#5d6b75, #aeaeae); border: 1px solid light-dark(#d4dde3, #354652);
    }
    .nt__push-nota {
      display: flex; gap: 8px; margin: 0; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem;
      background: light-dark(#f2f6f9, #1f262c); color: light-dark(#26323a, #c7d2da);
      .ti { flex-shrink: 0; margin-top: 2px; }
    }
    .nt__grupo { margin: 18px 0 6px; font-size: 0.95rem; font-weight: 700; color: light-dark(#26323a, #c7d2da); }
    .nt__lista { margin: 0; padding: 0; list-style: none; border: 1px solid light-dark(#e3e9ed, #354652); border-radius: 10px; }
    .nt__item {
      display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px;
      & + & { border-top: 1px solid light-dark(#e3e9ed, #354652); }
    }
    .nt__label { display: block; font-size: 0.9rem; font-weight: 700; color: light-dark(#26323a, #c7d2da); }
    .nt__detalle { display: block; font-size: 0.78rem; color: light-dark(#5d6b75, #aeaeae); }
  `,
})
export class AccountNotificacionesComponent {
  private readonly logsService = inject(IHttpLogsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly push = inject(NotificacionesEscritorioService);

  readonly grupos = TIPOS;
  private readonly activos = signal<Record<string, boolean>>({});
  readonly guardando = signal<string | null>(null);

  constructor() {
    void this.push.actualizar();
    this.logsService
      .getPreferencias()
      .pipe(takeUntilDestroyed())
      .subscribe((lista) => this.activos.set(Object.fromEntries(lista.map((p) => [p.tipo, p.activa]))));
  }

  /** Sin preferencia guardada, el aviso está activo. */
  activo(tipo: string): boolean {
    return this.activos()[tipo] ?? true;
  }

  cambiar(tipo: string, activa: boolean): void {
    this.guardando.set(tipo);
    this.activos.update((a) => ({ ...a, [tipo]: activa }));
    this.logsService
      .setPreferencia(tipo, activa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.guardando.set(null),
        error: () => {
          this.guardando.set(null);
          this.activos.update((a) => ({ ...a, [tipo]: !activa }));
          this.notificationService.error('No se pudo guardar la preferencia', 'Notificaciones');
        },
      });
  }

  async activarPush(): Promise<void> {
    if (await this.push.activar()) {
      this.notificationService.success('Te avisaremos en este dispositivo', 'Notificaciones');
    } else if (this.push.estado() === 'inactivo') {
      this.notificationService.error('No se pudieron activar. Vuelve a intentarlo.', 'Notificaciones');
    }
  }

  async cambiarPush(cual: 'mensajes' | 'notificaciones', activa: boolean): Promise<void> {
    try {
      await this.push.cambiar({ ...this.push.preferencias(), [cual]: activa });
    } catch {
      this.notificationService.error('No se pudo guardar la preferencia', 'Notificaciones');
    }
  }

  async desactivarPush(): Promise<void> {
    try {
      await this.push.desactivar();
    } catch {
      this.notificationService.error('No se pudieron desactivar', 'Notificaciones');
    }
  }
}

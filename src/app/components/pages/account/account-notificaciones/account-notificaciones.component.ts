import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

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
    grupo: 'Gente y posts que sigues',
    tipos: [
      { tipo: 'Seguir', label: 'Nuevos seguidores', detalle: 'Alguien empieza a seguirte' },
      { tipo: 'PostNuevoUsuarioQueSigues', label: 'Posts nuevos', detalle: 'Alguien que sigues publica un post' },
      { tipo: 'ComentarioSiguePost', label: 'Posts que sigues', detalle: 'Hay comentarios nuevos en un post que sigues' },
    ],
  },
];

/** /cuenta → Notificaciones: qué avisos llegan a la campana. Cada cambio se guarda al instante. */
@Component({
  selector: 'app-account-notificaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSlideToggle],
  template: `
    <section class="nt">
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

  readonly grupos = TIPOS;
  private readonly activos = signal<Record<string, boolean>>({});
  readonly guardando = signal<string | null>(null);

  constructor() {
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
}

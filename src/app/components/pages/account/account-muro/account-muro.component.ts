import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SeccionMuroPerfil } from 'src/app/models/perfil/perfil-muro.model';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

/** Lo que se puede ocultar del muro, agrupado como lo ve el usuario (MuroPrivacidad.Seccion en el API). */
const GRUPOS: { grupo: string; secciones: { id: SeccionMuroPerfil; label: string; detalle: string }[] }[] = [
  {
    grupo: 'Publicaciones',
    secciones: [
      { id: 'compartidos', label: 'Shouts compartidos', detalle: 'Los shouts de otros que compartes' },
      { id: 'posts', label: 'Posts', detalle: 'Los posts que publicas' },
      { id: 'fotos', label: 'Fotos', detalle: 'Las fotos que subes' },
    ],
  },
  {
    grupo: 'Participación',
    secciones: [
      { id: 'comentarios', label: 'Comentarios', detalle: 'Lo que comentas en posts, shouts, temas y fotos' },
      { id: 'comunidades', label: 'Comunidades', detalle: 'Las que creas o a las que te unes, y los temas que publicas' },
    ],
  },
  {
    grupo: 'Reacciones',
    secciones: [
      { id: 'puntos', label: 'Puntos y votos', detalle: 'Los puntos que das a posts y los votos a comentarios' },
      { id: 'favoritos', label: 'Favoritos y recomendaciones', detalle: 'Los posts que guardas o recomiendas' },
      { id: 'meGusta', label: 'Me gusta', detalle: 'Los shouts que te gustan' },
      { id: 'seguimientos', label: 'Seguimientos', detalle: 'Las personas y los posts que empiezas a seguir' },
    ],
  },
  {
    grupo: 'Logros',
    secciones: [{ id: 'rangos', label: 'Rangos', detalle: 'Cuando subes de rango' }],
  },
];

/**
 * /cuenta → Privacidad del muro: qué se ve en la línea de tiempo de tu perfil. Los shouts siempre se muestran.
 * Cada cambio se guarda al instante.
 */
@Component({
  selector: 'app-account-muro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSlideToggle],
  template: `
    <section class="mu">
      <p class="mu__intro">
        Elige qué aparece en la línea de tiempo de tu perfil. Lo que apagues deja de verse en tu muro, en la pestaña
        Actividad y en En Vivo para todos, también para ti. Los cambios se guardan solos.
      </p>

      <h3 class="mu__grupo">Siempre visible</h3>
      <ul class="mu__lista">
        <li class="mu__item">
          <span>
            <span class="mu__label" id="mu-shouts">Shouts</span>
            <span class="mu__detalle">Lo que publicas en tu muro y en el de otros, y lo que te escriben</span>
          </span>
          <mat-slide-toggle [checked]="true" [disabled]="true" aria-labelledby="mu-shouts" />
        </li>
      </ul>

      @for (g of grupos; track g.grupo) {
        <h3 class="mu__grupo">{{ g.grupo }}</h3>
        <ul class="mu__lista">
          @for (s of g.secciones; track s.id) {
            <li class="mu__item">
              <span>
                <span class="mu__label" [id]="'mu-' + s.id">{{ s.label }}</span>
                <span class="mu__detalle">{{ s.detalle }}</span>
              </span>
              <mat-slide-toggle [checked]="!ocultas().has(s.id)" [disabled]="cargando() || guardando()"
                [attr.aria-labelledby]="'mu-' + s.id" (change)="cambiar(s.id, $event.checked)" />
            </li>
          }
        </ul>
      }

      <p class="mu__nota">
        Ocultarlo no lo borra: tus posts, comentarios y fotos se siguen viendo donde los publicaste.
      </p>
    </section>
  `,
  styles: `
    .mu { max-width: 560px; padding: 16px 4px; }
    .mu__intro { margin: 0 0 8px; font-size: 0.88rem; color: light-dark(#5d6b75, #aeaeae); }
    .mu__grupo { margin: 18px 0 6px; font-size: 0.95rem; font-weight: 700; color: light-dark(#26323a, #c7d2da); }
    .mu__lista { margin: 0; padding: 0; list-style: none; border: 1px solid light-dark(#e3e9ed, #354652); border-radius: 10px; }
    .mu__item {
      display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px;
      & + & { border-top: 1px solid light-dark(#e3e9ed, #354652); }
    }
    .mu__label { display: block; font-size: 0.9rem; font-weight: 700; color: light-dark(#26323a, #c7d2da); }
    .mu__detalle { display: block; font-size: 0.78rem; color: light-dark(#5d6b75, #aeaeae); }
    .mu__nota { margin: 14px 2px 0; font-size: 0.8rem; color: light-dark(#5d6b75, #aeaeae); }
  `,
})
export class AccountMuroComponent {
  private readonly perfilService = inject(IHttpUsuarioPerfilService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly grupos = GRUPOS;
  readonly ocultas = signal<ReadonlySet<SeccionMuroPerfil>>(new Set());
  readonly cargando = signal(true);
  /** Mientras se guarda no se acepta otro cambio: así nunca llega una respuesta vieja después de una nueva. */
  readonly guardando = signal(false);

  constructor() {
    this.perfilService
      .getMuroPrivacidad()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (ocultas) => {
          this.ocultas.set(new Set(ocultas));
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  cambiar(seccion: SeccionMuroPerfil, mostrar: boolean): void {
    const antes = this.ocultas();
    const nuevas = new Set(antes);
    if (mostrar) nuevas.delete(seccion);
    else nuevas.add(seccion);

    this.ocultas.set(nuevas);
    this.guardando.set(true);
    this.perfilService
      .setMuroPrivacidad([...nuevas])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (guardadas) => {
          this.ocultas.set(new Set(guardadas));
          this.guardando.set(false);
        },
        error: () => {
          this.ocultas.set(antes);
          this.guardando.set(false);
          this.notificationService.error('No se pudo guardar la preferencia', 'Privacidad del muro');
        },
      });
  }
}

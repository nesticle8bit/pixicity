import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ShoutInteracciones, ShoutReaccion, ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { UserPopoverDirective } from 'src/app/shared/directives/userPopover.directive';
import { ShoutMediaComponent } from '../../../addons/shout-media/shout-media.component';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';

type Marca = 'meGusta' | 'favorito' | 'reshouteado';
type Total = 'meGustas' | 'favoritos' | 'reshouts';

const SIN_INTERACCIONES: ShoutInteracciones = {
  meGustas: 0,
  favoritos: 0,
  meGusta: false,
  favorito: false,
  comentarios: 0,
  reshouts: 0,
  reshouteado: false,
};

/**
 * Un shout en una lista (muro del perfil, /mi): globo con el texto y el adjunto, y las acciones comentar, compartir,
 * favorito y me gusta. Las acciones cambian al instante y vuelven atrás si el API falla.
 */
@Component({
  selector: 'app-shout-card',
  templateUrl: './shout-card.component.html',
  styleUrl: './shout-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UserPopoverDirective, UserAvatarComponent, MatTooltip, ShoutMediaComponent, DatePipe],
})
export class ShoutCardComponent {
  private readonly perfilService = inject(IHttpPerfilService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly usuarioActual = inject(IHttpSecurityService).getCurrentUser()?.usuario?.userName ?? null;

  readonly shout = input.required<ShoutViewModel>();
  /** En un reshout del muro de /mi: quién lo compartió. */
  readonly compartidoPor = input<{ userName: string; avatar: string | null } | null>(null);

  readonly interacciones = signal<ShoutInteracciones>(SIN_INTERACCIONES);
  readonly enviando = signal<Marca | null>(null);

  readonly autor = computed(() => this.shout().avatar?.userName ?? '');
  readonly enlace = computed(() => ['/shouts', this.autor(), this.shout().id]);
  /** Publicado en el muro de otro usuario ("@autor → @perfil"). */
  readonly muroAjeno = computed(() => {
    const perfil = this.shout().perfil?.userName;
    return perfil && perfil !== this.autor() ? perfil : null;
  });
  readonly esMio = computed(() => !!this.usuarioActual && this.usuarioActual === this.autor());

  constructor() {
    effect(() => this.interacciones.set({ ...SIN_INTERACCIONES, ...this.shout().interacciones }));
  }

  alternarMeGusta(): void {
    this.alternar('meGusta', 'meGustas', 'Inicia sesión para dar me gusta', (id) => this.perfilService.alternarMeGustaShout(id));
  }

  alternarFavorito(): void {
    this.alternar('favorito', 'favoritos', 'Inicia sesión para guardar en favoritos', (id) =>
      this.perfilService.alternarFavoritoShout(id),
    );
  }

  alternarReshout(): void {
    this.alternar('reshouteado', 'reshouts', 'Inicia sesión para compartir', (id) => this.perfilService.alternarReshoutShout(id));
  }

  private alternar(marca: Marca, total: Total, sinSesion: string, pedido: (id: number) => Observable<ShoutReaccion>): void {
    if (!this.usuarioActual) {
      this.notificationService.warning(sinSesion, 'Shouts');
      return;
    }
    if (this.enviando()) return;

    const antes = this.interacciones();
    const activo = !antes[marca];
    this.interacciones.set({ ...antes, [marca]: activo, [total]: Math.max(0, (antes[total] ?? 0) + (activo ? 1 : -1)) });
    this.enviando.set(marca);

    pedido(this.shout().id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.interacciones.update((i) => ({ ...i, [marca]: r.activo, [total]: r.total }));
          this.enviando.set(null);
        },
        error: () => {
          this.interacciones.set(antes);
          this.enviando.set(null);
        },
      });
  }
}

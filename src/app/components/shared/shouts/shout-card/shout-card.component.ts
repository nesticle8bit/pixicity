import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
import { TextoEnlazadoComponent } from '../texto-enlazado/texto-enlazado.component';

const VENTANA_EDICION_MS = 15 * 60 * 1000;
const MOTIVOS_DENUNCIA = ['Spam o publicidad', 'Contenido ofensivo', 'Acoso', 'Información falsa', 'Contenido sexual', 'Otro'];

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
  imports: [RouterLink, UserPopoverDirective, UserAvatarComponent, MatTooltip, ShoutMediaComponent, DatePipe, TextoEnlazadoComponent, FormsModule],
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

  /** Texto mostrado: arranca con el del shout y cambia al guardar una edición. */
  readonly texto = signal('');
  readonly editado = signal(false);
  readonly editando = signal(false);
  readonly guardandoEdicion = signal(false);
  textoEdicion = '';
  /** El autor puede corregir su shout durante los primeros 15 minutos (el API lo vuelve a verificar). */
  readonly puedeEditar = computed(
    () => this.esMio() && Date.now() - new Date(this.shout().fechaRegistro).getTime() < VENTANA_EDICION_MS,
  );

  private readonly dialog = inject(MatDialog);

  constructor() {
    effect(() => {
      const s = this.shout();
      this.interacciones.set({ ...SIN_INTERACCIONES, ...s.interacciones });
      this.texto.set(s.comentario ?? '');
      this.editado.set(!!s.fechaActualiza);
    });
  }

  empezarEdicion(): void {
    this.textoEdicion = this.texto();
    this.editando.set(true);
  }

  guardarEdicion(): void {
    const nuevo = this.textoEdicion.trim();
    if (!nuevo || this.guardandoEdicion()) return;
    this.guardandoEdicion.set(true);
    this.perfilService
      .editarShout(this.shout().id, nuevo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.texto.set(nuevo);
          this.editado.set(true);
          this.editando.set(false);
          this.guardandoEdicion.set(false);
        },
        error: (e: unknown) => {
          this.guardandoEdicion.set(false);
          this.notificationService.error(e instanceof Error ? e.message : 'No se pudo editar el shout', 'Shouts');
        },
      });
  }

  async denunciar(): Promise<void> {
    if (!this.usuarioActual) {
      this.notificationService.warning('Inicia sesión para denunciar', 'Shouts');
      return;
    }
    const { DialogMotivoDenunciaComponent } = await import('../../../dialogs/dialog-motivo-denuncia/dialog-motivo-denuncia.component');
    this.dialog
      .open(DialogMotivoDenunciaComponent, { width: '440px', maxWidth: '95vw', data: { que: 'shout', motivos: MOTIVOS_DENUNCIA } })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((motivo?: string) => {
        if (!motivo) return;
        this.perfilService
          .denunciarShout(this.shout().id, motivo)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.notificationService.success('Denuncia enviada. Gracias por reportar.', 'Denuncia'),
            error: (e: unknown) => this.notificationService.error(e instanceof Error ? e.message : 'No se pudo denunciar', 'Denuncia'),
          });
      });
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

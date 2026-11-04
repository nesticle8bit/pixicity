import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { Muro } from 'src/app/models/mi/mi-vm.model';
import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { TextoEnlazadoComponent } from '../../shared/shouts/texto-enlazado/texto-enlazado.component';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { enlaceShout, imagenShout } from '../../../shared/helpers/shout-imagen';

/** Ícono y texto para los shouts sin comentario (solo media). */
const MEDIA: Record<string, { icono: string; texto: string }> = {
  Foto: { icono: 'ti-photo', texto: 'Compartió una imagen' },
  Video: { icono: 'ti-brand-youtube', texto: 'Compartió un video' },
  VideoArchivo: { icono: 'ti-movie', texto: 'Compartió un video' },
  Enlace: { icono: 'ti-link', texto: 'Compartió un enlace' },
  Spotify: { icono: 'ti-brand-spotify', texto: 'Compartió música' },
};

/** Lista compacta con los últimos shouts publicados en toda la comunidad (el muro "todos" de /mi, que el API ya filtra sin NSFW). */
@Component({
  selector: 'app-home-ultimos-shouts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-ultimos-shouts.component.html',
  styleUrls: ['./home-ultimos-shouts.component.scss'],
  imports: [RouterLink, MatTooltip, UserAvatarComponent, TruncatePipe, TextoEnlazadoComponent, UserPopoverDirective],
})
export class HomeUltimosShoutsComponent {
  private readonly miService = inject(IHttpMiService);
  private readonly perfilService = inject(IHttpPerfilService);

  readonly cantidad = input(5);
  /**
   * Página de un shout: en vez de los de toda la comunidad, los últimos del mismo autor sin ese shout
   * ("Más shouts de @autor"). Mismo diseño que en la portada.
   */
  readonly delShout = input<number | null>(null);
  readonly autor = input<string | null>(null);

  /** undefined = cargando. */
  readonly shouts = toSignal(
    toObservable(computed(() => ({ cantidad: this.cantidad(), delShout: this.delShout() }))).pipe(
      switchMap(({ cantidad, delShout }) =>
        (delShout
          ? this.perfilService.getShoutsDelAutor(delShout, cantidad)
          : // El muro mezcla posts y reshouts: se piden de más para que alcancen los shouts propios.
            this.miService.getMuro('todos', null, cantidad * 2).pipe(map((m) => this.soloShouts(m, cantidad)))
        ).pipe(
          catchError(() => of([] as ShoutViewModel[])),
          startWith(undefined),
        ),
      ),
    ),
  );

  readonly enlace = enlaceShout;
  readonly imagen = imagenShout;

  media(s: ShoutViewModel): { icono: string; texto: string } | null {
    return MEDIA[s.tipo] ?? null;
  }

  private soloShouts(muro: Muro, cantidad: number): ShoutViewModel[] {
    return muro.items
      .filter((i) => i.tipo === 'shout' && !!i.shout)
      .map((i) => i.shout as ShoutViewModel)
      .slice(0, cantidad);
  }
}

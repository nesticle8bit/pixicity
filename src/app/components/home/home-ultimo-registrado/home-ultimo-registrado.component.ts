import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { PortadaService } from 'src/app/services/shared/portada.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { CountryFlagComponent } from '../../addons/country-flag/country-flag.component';
import { GenreIconComponent } from '../../addons/genre-icon/genre-icon.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

/**
 * Tarjeta con el último usuario registrado. Sale de la misma lista que "Últimos Registrados" (PortadaService la pide
 * una sola vez) y después trae su info pública (la del popover) para rango, mensaje y números.
 */
@Component({
  selector: 'app-home-ultimo-registrado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-ultimo-registrado.component.html',
  styleUrls: ['./home-ultimo-registrado.component.scss'],
  imports: [RouterLink, MatTooltip, UserAvatarComponent, CountryFlagComponent, GenreIconComponent, TimeAgoPipe, TruncatePipe],
})
export class HomeUltimoRegistradoComponent {
  private readonly portada = inject(PortadaService);
  private readonly securityService = inject(IHttpSecurityService);
  private readonly usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  /** undefined = cargando; null = no hay nadie (o falló). */
  readonly usuario = toSignal<UsuarioInfoViewModel | null | undefined>(
    this.portada.tomar('usuariosRecientes', this.securityService.getLastRegisteredUsers()).pipe(
      map((usuarios) => usuarios?.[0]?.userName ?? null),
      switchMap((userName) => (userName ? this.usuarioPerfilService.getUsuarioInfo(userName) : of(null))),
      catchError(() => of(null)),
      startWith(undefined),
    ),
  );
}

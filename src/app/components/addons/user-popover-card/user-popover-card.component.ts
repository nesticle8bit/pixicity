import { MatTooltip } from '@angular/material/tooltip';
import { Component, OnChanges, inject, input } from '@angular/core';
import { UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { NgClass } from '@angular/common';
import { CountryFlagComponent } from '../country-flag/country-flag.component';
import { RouterLink } from '@angular/router';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { FollowButtonComponent } from '../follow-button/follow-button.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
    selector: 'app-user-popover-card',
    templateUrl: './user-popover-card.component.html',
    styleUrls: ['./user-popover-card.component.scss'],
    imports: [MatTooltip, 
        UserAvatarComponent,
        NgClass,
        CountryFlagComponent,
        RouterLink,
        TruncatePipe,
        FollowButtonComponent,
    ],
})
export class UserPopoverCardComponent implements OnChanges {
  private securityService = inject(IHttpSecurityService);

  readonly userData = input<UsuarioInfoViewModel | null>(null);
  readonly activo = input<number | null>(null);
  readonly loading = input<boolean>(true);

  public isOnline: boolean = false;

  ngOnChanges(): void {
    const activo = this.activo();
    this.isOnline =
      activo !== null && activo !== undefined && activo <= 15;
  }

  /** Mismo criterio que app-follow-button: con sesión y que no sea uno mismo (si no, la fila quedaría vacía). */
  get puedeSeguir(): boolean {
    const yo = this.securityService.getCurrentUser()?.usuario?.userName;
    return !!yo && yo !== this.userData()?.userName;
  }

  /** Los datos son los del caché del popover: así el contador queda al día también al volver a abrirlo. */
  alCambiarSeguimiento(siguiendo: boolean): void {
    const datos = this.userData();
    if (datos) {
      datos.seguidoresCount = Math.max(0, (datos.seguidoresCount || 0) + (siguiendo ? 1 : -1));
    }
  }

  get memberSince(): string {
    const fecha = this.userData()?.fechaRegistro;
    if (!fecha) return '';

    const d = new Date(fecha);
    return d.toLocaleDateString('es', { year: 'numeric', month: 'short' });
  }
}

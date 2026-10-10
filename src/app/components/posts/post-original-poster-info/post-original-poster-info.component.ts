import { Subscription } from 'rxjs';
import { UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { NgStyle, DatePipe } from '@angular/common';
import { UserOnlineStatusComponent } from '../../addons/user-online-status/user-online-status.component';
import { CountryFlagComponent } from '../../addons/country-flag/country-flag.component';
import { GenreIconComponent } from '../../addons/genre-icon/genre-icon.component';
import { FollowButtonComponent } from '../../addons/follow-button/follow-button.component';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

@Component({
    selector: 'app-post-original-poster-info',
    templateUrl: './post-original-poster-info.component.html',
    styleUrls: ['./post-original-poster-info.component.scss'],
    imports: [
    RouterLink,
    UserPopoverDirective,
    MatTooltip,
    UserAvatarComponent,
    NgStyle,
    UserOnlineStatusComponent,
    CountryFlagComponent,
    GenreIconComponent,
    FollowButtonComponent,
    DatePipe
],
})
export class PostOriginalPosterInfoComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  private readonly destroyRef = inject(DestroyRef);
  private cargaGetUsuarioInfo?: Subscription;

  private _userName = '';

  @Input() set userName(value: string) {
    this._userName = value;

    if (value) {
      this.getUsuarioInfo(value);
    }
  }

  get userName(): string {
    return this._userName;
  }

  public info?: UsuarioInfoViewModel;
  public currentUser?: JwtUserModel;

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  getUsuarioInfo(userName: string): void {
    if (!userName) {
      return;
    }

    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetUsuarioInfo?.unsubscribe();

    this.cargaGetUsuarioInfo = this.usuarioPerfilService.getUsuarioInfo(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.info = response;
      }
    });
  }

  changeSeguidores(value: boolean): void {
    if (this.info) {
      // La tarjeta muestra seguidoresCount (antes se sumaba a un campo "seguidores" que no se mostraba).
      this.info.seguidoresCount = Math.max(0, (this.info.seguidoresCount ?? 0) + (value ? 1 : -1));
    }
  }
}

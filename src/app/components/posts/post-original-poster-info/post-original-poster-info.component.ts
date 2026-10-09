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

  private _userName: any;

  @Input() set userName(value: any) {
    this._userName = value;

    if (value) {
      this.getUsuarioInfo(value);
    }
  }

  get userName(): any {
    return this._userName;
  }

  public info: any;
  public currentUser?: JwtUserModel;

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  getUsuarioInfo(userName: string): void {
    if (!userName) {
      return;
    }

    this.usuarioPerfilService.getUsuarioInfo(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.info = response;
      }
    });
  }

  changeSeguidores(value: boolean): void {
    if (this.info) {
      if (!this.info.seguidores) {
        this.info.seguidores = 0;
      }

      if (value) {
        this.info.seguidores += 1;
      } else {
        this.info.seguidores -= 1;
      }
    }
  }
}

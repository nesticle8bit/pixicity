import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../../shared/directives/userPopover.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { IHttpUsuarioPerfilService } from '../../../../services/interfaces/httpUsuarioPerfil.interface';

@Component({
    selector: 'app-perfil-user-followers',
    templateUrl: './perfil-user-followers.component.html',
    styleUrls: ['./perfil-user-followers.component.scss'],
    imports: [
        UserAvatarComponent,
        RouterLink,
        UserPopoverDirective,
        MatTooltip,
    ],
})
export class PerfilUserFollowersComponent implements OnInit {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  private readonly destroyRef = inject(DestroyRef);

  private _usuarioId: any;
  public followers: any[] = [];
  public totalCount: number = 0;

  @Input() set usuarioId(value: any) {
    this._usuarioId = value;

    if (value) {
      this.getSeguidores();
    }
  }

  get usuarioId(): any {
    return this._usuarioId;
  }

  ngOnInit(): void {}

  getSeguidores(): void {
    if (!this._usuarioId) {
      return;
    }

    this.usuarioPerfilService
      .getLastFollowersByUserId(this._usuarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.followers = response.followers;
        this.totalCount = response.totalCount;
      });
  }
}

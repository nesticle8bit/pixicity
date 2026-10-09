import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, DestroyRef, inject, OnChanges, SimpleChanges, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { FollowButtonComponent } from '../../addons/follow-button/follow-button.component';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

/** Lista paginada de seguidores del usuario o de usuarios que sigue. */
@Component({
    selector: 'app-profile-follows',
    templateUrl: './profile-follows.component.html',
    styleUrls: ['./profile-follows.component.scss'],
    imports: [
        UserAvatarComponent,
        RouterLink,
        UserPopoverDirective,
        FollowButtonComponent,
        MatPaginator,
    ],
})
export class ProfileFollowsComponent implements OnChanges {
  paginationService = inject(PaginationService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  private readonly destroyRef = inject(DestroyRef);

  readonly tipo = input<'seguidores' | 'siguiendo'>('seguidores');
  readonly user = input<any>();

  public usuarios: any[] = [];
  public totalCount: number = 0;

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.user() && (changes['user'] || changes['tipo'])) {
      this.getUsuarios();
    }
  }

  getUsuarios(): void {
    const request = this.tipo() === 'siguiendo'
      ? this.usuarioPerfilService.getFollowingUsersByUserId(this.user().id)
      : this.usuarioPerfilService.getFollowersByUserId(this.user().id);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.usuarios = response?.data ?? [];
      this.totalCount = response?.pagination?.totalCount ?? 0;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getUsuarios();
  }
}

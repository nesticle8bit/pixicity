import { Subscription } from 'rxjs';
import { Component, DestroyRef, inject, Input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../../shared/directives/userPopover.directive';
import { DecimalPipe } from '@angular/common';
import { IHttpUsuarioPerfilService } from '../../../../services/interfaces/httpUsuarioPerfil.interface';

/** Últimos seguidores en la columna lateral del perfil. */
@Component({
  selector: 'app-perfil-user-followers',
  templateUrl: './perfil-user-followers.component.html',
  styleUrls: ['./perfil-user-followers.component.scss'],
  imports: [UserAvatarComponent, RouterLink, UserPopoverDirective, DecimalPipe],
})
export class PerfilUserFollowersComponent {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private readonly destroyRef = inject(DestroyRef);
  private carga?: Subscription;

  /** "Ver todos": el padre abre la pestaña de seguidores. */
  readonly verTodos = output<void>();

  public followers: { userName: string; avatar: string }[] = [];
  public totalCount = 0;
  public cargado = false;

  @Input() set usuarioId(value: number | null | undefined) {
    this.followers = [];
    this.totalCount = 0;
    this.cargado = false;
    if (value) {
      this.getSeguidores(value);
    }
  }

  private getSeguidores(usuarioId: number): void {
    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.
    this.carga?.unsubscribe();
    this.carga = this.usuarioPerfilService
      .getLastFollowersByUserId(usuarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.followers = response?.followers ?? [];
        this.totalCount = response?.totalCount ?? 0;
        this.cargado = true;
      });
  }
}

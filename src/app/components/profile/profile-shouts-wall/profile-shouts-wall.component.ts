import { Subscription } from 'rxjs';
import { PerfilRef, SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { MatTooltip } from '@angular/material/tooltip';
import { ShoutMediaComponent } from '../../addons/shout-media/shout-media.component';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-profile-shouts-wall',
    templateUrl: './profile-shouts-wall.component.html',
    styleUrls: ['./profile-shouts-wall.component.scss'],
    imports: [RouterLink, UserPopoverDirective, UserAvatarComponent, MatTooltip, ShoutMediaComponent, DatePipe]
})
export class ProfileShoutsWallComponent implements OnInit {
  private perfilService = inject(IHttpPerfilService);
  paginationService = inject(PaginationService);

  private readonly destroyRef = inject(DestroyRef);
  private cargaGetShouts?: Subscription;

  private _user: PerfilRef = SIN_PERFIL;
  private _load = false;

  @Input() set user(value: PerfilRef | null) {
    this._user = value ?? SIN_PERFIL;

    if (value && value.id) {
      this.getShouts();
    }
  }

  @Input() set load(value: boolean) {
    this._load = value;

    if (value) {
      this.getShouts();
    }
  }

  get user(): PerfilRef {
    return this._user;
  }
  
  public shoutsList: any[] = [];
  public totalCount: number = 0;
  
  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnInit(): void {
    
  }

  getShouts(): void {
    if (!this.user.id) {
      return;
    }

    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetShouts?.unsubscribe();

    this.cargaGetShouts = this.perfilService.getShouts(this.user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.shoutsList = response.shouts;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getShouts();
  }

}

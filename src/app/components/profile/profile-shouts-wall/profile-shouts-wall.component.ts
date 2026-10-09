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

  private _user: any;
  private _load: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value && value.id) {
      this.getShouts();
    }
  }

  @Input() set load(value: any) {
    this._load = value;

    if (value) {
      this.getShouts();
    }
  }

  get user(): any {
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
    this.perfilService.getShouts(this.user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.shoutsList = response.shouts;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getShouts();
  }

}

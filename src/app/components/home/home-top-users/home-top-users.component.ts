import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TopUserModel } from 'src/app/models/web/topUser.model';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { FollowButtonComponent } from '../../addons/follow-button/follow-button.component';

@Component({
    selector: 'app-home-top-users',
    templateUrl: './home-top-users.component.html',
    styleUrls: ['./home-top-users.component.scss'],
    imports: [
        UserAvatarComponent,
        MatTooltip,
        RouterLink,
        UserPopoverDirective,
        FollowButtonComponent,
    ],
})
export class HomeTopUsersComponent implements OnInit {
  private httpWeb = inject(IHttpWebService);

  private readonly destroyRef = inject(DestroyRef);

  public topUsers: TopUserModel[] = [];

  ngOnInit(): void {
    this.getTopUsers();
  }

  getTopUsers(): void {
    this.httpWeb
      .getTopUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: TopUserModel[]) => {
        this.topUsers = value;
      });
  }
}

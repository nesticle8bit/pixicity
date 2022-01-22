import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-profile-following',
  templateUrl: './profile-following.component.html',
  styleUrls: ['./profile-following.component.scss'],
})
export class ProfileFollowingComponent implements OnInit {
  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value) {
      this.getFollowingUsersByUserId();
    }
  }

  get user(): any {
    return this._user;
  }

  public followingUsers: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService
  ) {}

  ngOnInit(): void {}

  getFollowingUsersByUserId(): void {
    this.securityService
      .getFollowingUsersByUserId(this.user.id)
      .subscribe((response: any) => {
        this.followingUsers = response?.data;
        this.totalCount = response?.pagination?.totalCount;
      });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getFollowingUsersByUserId();
  }
}

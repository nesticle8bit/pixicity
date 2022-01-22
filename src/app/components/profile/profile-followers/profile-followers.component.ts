import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-profile-followers',
  templateUrl: './profile-followers.component.html',
  styleUrls: ['./profile-followers.component.scss']
})
export class ProfileFollowersComponent implements OnInit {
  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value) {
      this.getFollowersByUserId();
    }
  }

  get user(): any {
    return this._user;
  }

  public followers: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService
  ) {}

  ngOnInit(): void {}

  getFollowersByUserId(): void {
    this.securityService
      .getFollowersByUserId(this.user.id)
      .subscribe((response: any) => {
        this.followers = response?.data;
        this.totalCount = response?.pagination?.totalCount;
      });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getFollowersByUserId();
  }
}

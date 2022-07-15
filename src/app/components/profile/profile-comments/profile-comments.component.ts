import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-profile-comments',
  templateUrl: './profile-comments.component.html',
  styleUrls: ['./profile-comments.component.scss'],
})
export class ProfileCommentsComponent implements OnInit {
  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value) {
      this.getCommentsByUserId();
    }
  }

  get user(): any {
    return this._user;
  }

  public comments: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postService: IHttpPostsService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnInit(): void {}

  getCommentsByUserId(): void {
    this.postService.getComentariosByUserId(this.user.id).subscribe((response: any) => {
      this.comments = response?.data;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getCommentsByUserId();
  }
}

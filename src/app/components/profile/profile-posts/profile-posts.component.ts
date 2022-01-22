import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-profile-posts',
  templateUrl: './profile-posts.component.html',
  styleUrls: ['./profile-posts.component.scss'],
})
export class ProfilePostsComponent implements OnInit {
  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value) {
      this.getPosts();
    }
  }

  get user(): any {
    return this._user;
  }

  public posts: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postService: IHttpPostsService
  ) {}

  ngOnInit(): void {}

  getPosts(): void {
    this.postService
      .getPostsByUserId(this.user.id)
      .subscribe((response: any) => {
        this.posts = response.data;
        this.totalCount = response.pagination.totalCount;
      });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPosts();
  }
}

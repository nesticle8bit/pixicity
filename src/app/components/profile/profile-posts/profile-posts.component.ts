import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';

@Component({
  standalone: false,
  selector: 'app-profile-posts',
  templateUrl: './profile-posts.component.html',
  styleUrls: ['./profile-posts.component.scss'],
})
export class ProfilePostsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnInit(): void {}

  getPosts(): void {
    this.postService
      .getPostsByUserId(this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
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

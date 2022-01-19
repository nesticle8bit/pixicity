import { ViewportScroller } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-home-last-posts',
  templateUrl: './home-last-posts.component.html',
  styleUrls: ['./home-last-posts.component.scss'],
})
export class HomeLastPostsComponent implements OnInit {
  private _categoria: string = '';

  @Input() set categoria(value: string) {
    this._categoria = value;

    let pageEvent: PageEvent = { pageIndex: 0, pageSize: 32, length: 0 };
    this.pageChange(pageEvent);
  }

  get categoria(): string {
    return this._categoria;
  }

  public stickyPosts: any = [];
  public lastPosts: any = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postService: IHttpPostsService,
    private viewPort: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.getStickyPosts();
  }

  getPosts(categoria: string): void {
    this.postService.getPosts(categoria).subscribe((response: any) => {
      this.lastPosts = response.data;

      this.lastPosts = this.lastPosts.map((post: any) => {
        post.url = post.titulo.toLowerCase().replace(/\s/g, '-');
        return post;
      });

      this.totalCount = response.pagination.totalCount;
    });
  }

  getStickyPosts(): void {
    this.postService.getStickyPosts().subscribe((posts: any) => {
      posts = posts.map((post: any) => {
        post.url = post.titulo.toLowerCase().replace(/\s/g, '-');
        return post;
      });

      this.stickyPosts = posts;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPosts(this.categoria);

    this.viewPort.scrollToPosition([0, 0]);
  }
}

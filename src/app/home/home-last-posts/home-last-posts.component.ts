import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-home-last-posts',
  templateUrl: './home-last-posts.component.html',
  styleUrls: ['./home-last-posts.component.scss']
})
export class HomeLastPostsComponent implements OnInit {
  public stickyPosts: any = [];
  public lastPosts: any = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postService: IHttpPostsService
  ) { }

  ngOnInit(): void {
    this.getStickyPosts();
    
    let pageEvent: PageEvent = { pageIndex: 0, pageSize: 32, length: 0 };
    this.pageChange(pageEvent);
  }

  getPosts(): void {
    this.postService.getPosts().subscribe((response: any) => {
      this.lastPosts = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  getStickyPosts(): void {
    this.postService.getStickyPosts().subscribe((posts: any) => {
      this.stickyPosts = posts;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPosts();
  }
}

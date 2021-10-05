import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-table-posts',
  templateUrl: './table-posts.component.html',
  styleUrls: ['./table-posts.component.scss']
})
export class TablePostsComponent implements OnInit {
  public posts: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postsService: IHttpPostsService
  ) { }

  ngOnInit(): void {
    this.getPosts();
  }

  getPosts(): void {
    this.postsService.getPostsAdmin('').subscribe((response: any) => {
      if (response?.data) {
        response.data = response.data.map((post: any) => {
          post.url = post.titulo.toLowerCase().replace(/\s/g, '-');
          return post;
        });
      }

      this.posts = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPosts();
  }

}

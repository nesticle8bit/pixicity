import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-table-comments',
  templateUrl: './table-comments.component.html',
  styleUrls: ['./table-comments.component.scss'],
})
export class TableCommentsComponent implements OnInit {
  public comments: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postsService: IHttpPostsService
  ) {}

  ngOnInit(): void {
    this.getComentarios();
  }

  getComentarios(): void {
    this.postsService.getComentarios().subscribe((response: any) => {
      this.comments = response?.data;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getComentarios();
  }
}

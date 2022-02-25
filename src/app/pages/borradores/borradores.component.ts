import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-borradores',
  templateUrl: './borradores.component.html',
  styleUrls: ['./borradores.component.scss'],
})
export class BorradoresComponent implements OnInit {
  public borradores: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postService: IHttpPostsService
  ) {}

  ngOnInit(): void {
    this.getBorradores();
  }

  getBorradores(): void {
    this.postService.getBorradores().subscribe((response: any) => {
      this.borradores = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  deleteBorrador(borrador: any): void {
    console.log(borrador);
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getBorradores();
  }
}

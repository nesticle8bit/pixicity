import { IHttpNoticiasService } from 'src/app/services/interfaces/httpNoticias.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-noticias',
  templateUrl: './table-noticias.component.html',
  styleUrls: ['./table-noticias.component.scss'],
})
export class TableNoticiasComponent implements OnInit {
  public noticias: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private noticiasService: IHttpNoticiasService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {}

  getNoticias(): void {
    this.noticiasService.getNoticias('').subscribe((response: any) => {
      if (response?.data) {
        this.noticias = response?.data;
        this.totalCount = response?.pagination?.totalCount;
      }
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getNoticias();
  }
}

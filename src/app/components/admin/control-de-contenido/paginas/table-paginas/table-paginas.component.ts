import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-table-paginas',
  templateUrl: './table-paginas.component.html',
  styleUrls: ['./table-paginas.component.scss'],
})
export class TablePaginasComponent implements OnInit {
  public paginas: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {}

  getPaginas(): void {

  }

  createUpdatePagina(pagina: any = null): void {}

  deletePagina(pagina: any): void {}

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPaginas();
  }
}

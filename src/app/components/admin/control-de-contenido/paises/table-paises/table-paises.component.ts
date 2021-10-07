import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-table-paises',
  templateUrl: './table-paises.component.html',
  styleUrls: ['./table-paises.component.scss'],
})
export class TablePaisesComponent implements OnInit {
  public paises: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private parametrosService: IHttpParametrosService
  ) {}

  ngOnInit(): void {
    this.getPaises();
  }

  getPaises(): void {
    this.parametrosService.getPaises().subscribe((response: any) => {
      this.paises = response?.data;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPaises();
  }
}

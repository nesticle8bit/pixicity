import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpDenunciasService } from 'src/app/services/interfaces/httpDenuncias.interface';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-table-reportes',
  templateUrl: './table-reportes.component.html',
  styleUrls: ['./table-reportes.component.scss']
})
export class TableReportesComponent implements OnInit {
  public denuncias: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private denunciaService: IHttpDenunciasService
  ) { }

  ngOnInit(): void {
    this.getDenuncias();
  }

  getDenuncias(): void {
    this.denunciaService.getDenuncias().subscribe((response: any) => {
      this.denuncias = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getDenuncias();
  }
}

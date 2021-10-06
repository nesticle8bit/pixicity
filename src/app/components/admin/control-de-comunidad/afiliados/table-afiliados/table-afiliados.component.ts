import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-table-afiliados',
  templateUrl: './table-afiliados.component.html',
  styleUrls: ['./table-afiliados.component.scss']
})
export class TableAfiliadosComponent implements OnInit {
  public afiliados: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private generalService: IHttpGeneralService
  ) { }

  ngOnInit(): void {
    this.getAfiliados();
  }

  getAfiliados(): void {
    this.generalService.getAfiliados().subscribe((response: any) => {
      this.afiliados = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getAfiliados();
  }
}

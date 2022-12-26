import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-table-contactos',
  templateUrl: './table-contactos.component.html',
  styleUrls: ['./table-contactos.component.scss'],
})
export class TableContactosComponent implements OnInit {
  public contactos: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private generalService: IHttpGeneralService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getContactos();
  }

  getContactos(): void {
    this.generalService.getContactos().subscribe((response: any) => {
      this.contactos = response?.contactos;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getContactos();
  }
}

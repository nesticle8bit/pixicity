import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-table-rangos',
  templateUrl: './table-rangos.component.html',
  styleUrls: ['./table-rangos.component.scss']
})
export class TableRangosComponent implements OnInit {
  public rangos: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService,
  ) { }

  ngOnInit(): void {
    this.getRangos();
  }

  getRangos(): void {
    this.securityService.getRangosUsuarios().subscribe((response: any) => {
      this.rangos = response?.rangos;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getRangos();
  }

  updateRango(id: number): void {

  }

  deleteRango(id: number): void {

  }
}

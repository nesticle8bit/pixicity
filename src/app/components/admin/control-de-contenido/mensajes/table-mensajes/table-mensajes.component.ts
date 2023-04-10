import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-mensajes',
  templateUrl: './table-mensajes.component.html',
  styleUrls: ['./table-mensajes.component.scss'],
})
export class TableMensajesComponent implements OnInit {
  public mensajes: any;
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private mensajesService: IHttpMensajesService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getMensajes();
  }

  getMensajes(): void {
    this.mensajesService.getMensajesAdmin({}).subscribe((response: any) => {
      this.mensajes = response?.mensajes;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getMensajes();
  }

  deleteMensaje(mensaje: any): void {
    this.mensajesService
      .deleteMensajesById([mensaje.id])
      .subscribe((response: any) => {
        if (response) {
          mensaje.eliminado = true;
        }
      });
  }
}

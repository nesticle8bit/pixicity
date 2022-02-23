import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-afiliados',
  templateUrl: './table-afiliados.component.html',
  styleUrls: ['./table-afiliados.component.scss'],
})
export class TableAfiliadosComponent implements OnInit {
  public afiliados: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private generalService: IHttpGeneralService,
    private webService: IHttpWebService
  ) {}

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

  activarDesactivarAfiliado(afiliado: any): void {
    if (!afiliado) {
      return;
    }

    this.webService
      .changeAfiliadoActive({ id: afiliado.id, activo: afiliado.activo })
      .subscribe((response: any) => {
        if (response) {
          Swal.fire({
            title: afiliado.activo ? 'Desactivado' : 'Activado',
            text: afiliado.activo
              ? 'El afiliado ha sido deshabilitado en el inicio de la página'
              : 'El afiliado ha sido activado en el inicio de la página',
            icon: 'success',
            timer: 3000,
          });

          afiliado.activo = !afiliado.activo;
        }
      });
  }
}

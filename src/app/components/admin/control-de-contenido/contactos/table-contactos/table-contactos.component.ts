import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import Swal from 'sweetalert2';

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

  gestionarContacto(contacto: any): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro de gestionar este contacto?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Gestionar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.generalService
          .gestionarContacto(contacto.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Gestionado',
                text: 'El contacto ha sido gestionado correctamente',
                icon: 'success',
                timer: 3000,
              });

              this.getContactos();
            }
          });
      }
    });
  }

  deleteContacto(contacto: any): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro de eliminar este contacto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.generalService
          .deleteContacto(contacto.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Eliminado',
                text: 'El contacto ha sido eliminado correctamente',
                icon: 'success',
                timer: 3000,
              });
              this.getContactos();
            }
          });
      }
    });
  }
}

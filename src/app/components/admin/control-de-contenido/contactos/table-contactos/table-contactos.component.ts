import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-contactos',
  templateUrl: './table-contactos.component.html',
  styleUrls: ['./table-contactos.component.scss'],
})
export class TableContactosComponent implements OnInit {
  public contactos: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private generalService: IHttpGeneralService,
    private notificationService: NotificationService
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
    if (this.notificationService.confirm('¿Está seguro de gestionar este contacto?')) {
      this.generalService.gestionarContacto(contacto.id).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('El contacto ha sido gestionado correctamente', 'Gestionado');
          this.getContactos();
        }
      });
    }
  }

  deleteContacto(contacto: any): void {
    if (this.notificationService.confirm('¿Está seguro de eliminar este contacto?')) {
      this.generalService.deleteContacto(contacto.id).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('El contacto ha sido eliminado correctamente', 'Eliminado');
          this.getContactos();
        }
      });
    }
  }
}

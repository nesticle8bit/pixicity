import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly destroyRef = inject(DestroyRef);

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
    this.generalService.getContactos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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
      this.generalService.gestionarContacto(contacto.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('El contacto ha sido gestionado correctamente', 'Gestionado');
          this.getContactos();
        }
      });
    }
  }

  deleteContacto(contacto: any): void {
    if (this.notificationService.confirm('¿Está seguro de eliminar este contacto?')) {
      this.generalService.deleteContacto(contacto.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('El contacto ha sido eliminado correctamente', 'Eliminado');
          this.getContactos();
        }
      });
    }
  }
}

import { ContactoAdmin } from 'src/app/models/admin/filas-admin.model';
import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-table-contactos',
    templateUrl: './table-contactos.component.html',
    styleUrls: ['./table-contactos.component.scss'],
    imports: [
        AdminFiltrosComponent,
        NgClass,
        MatTooltip,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatPaginator,
        TimeAgoPipe,
        TruncatePipe,
    ],
})
export class TableContactosComponent implements OnInit {
  paginationService = inject(PaginationService);
  private generalService = inject(IHttpGeneralService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public contactos: ContactoAdmin[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar por nombre, email o mensaje...',
    fechas: true,
    estado: true,
    orden: true,
    tipoLabel: 'Gestión',
    tipos: [
      { valor: 'pendientes', label: 'Pendientes' },
      { valor: 'gestionados', label: 'Gestionados' },
    ],
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getContactos();
  }

  getContactos(): void {
    this.cargando = true;
    this.generalService.getContactos(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.contactos = response?.contactos ?? [];
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getContactos();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getContactos();
  }

  gestionarContacto(contacto: ContactoAdmin): void {
    if (this.notificationService.confirm('¿Está seguro de gestionar este contacto?')) {
      this.generalService.gestionarContacto(contacto.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.notificationService.success('El contacto ha sido gestionado correctamente', 'Gestionado');
          this.getContactos();
        }
      });
    }
  }

  deleteContacto(contacto: ContactoAdmin): void {
    if (this.notificationService.confirm('¿Está seguro de eliminar este contacto?')) {
      this.generalService.deleteContacto(contacto.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.notificationService.success('El contacto ha sido eliminado correctamente', 'Eliminado');
          this.getContactos();
        }
      });
    }
  }
}

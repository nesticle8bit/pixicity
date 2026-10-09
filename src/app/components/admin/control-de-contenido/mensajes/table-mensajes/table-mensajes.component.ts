import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { UserAvatarComponent } from '../../../../addons/user-avatar/user-avatar.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-table-mensajes',
    templateUrl: './table-mensajes.component.html',
    styleUrls: ['./table-mensajes.component.scss'],
    imports: [
        AdminFiltrosComponent,
        NgClass,
        MatTooltip,
        UserAvatarComponent,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatDivider,
        MatPaginator,
        TimeAgoPipe,
        TruncatePipe,
    ],
})
export class TableMensajesComponent implements OnInit {
  paginationService = inject(PaginationService);
  private mensajesService = inject(IHttpMensajesService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public mensajes: any;
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar en asunto, contenido o usuarios...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Remitente o destinatario',
    tipos: [
      { valor: 'no-leidos', label: 'No leídos' },
    ],
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getMensajes();
  }

  getMensajes(): void {
    this.cargando = true;
    this.mensajesService.getMensajesAdmin(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.mensajes = response?.mensajes;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getMensajes();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getMensajes();
  }

  deleteMensaje(mensaje: any): void {
    this.mensajesService
      .deleteMensajesById([mensaje.id])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          mensaje.eliminado = true;
        }
      });
  }

  changeRemitente(mensaje: any): void {
    const userName = this.notificationService.prompt('Ingresa el nombre de usuario del nuevo remitente de este mensaje, si no existe no se podrá cambiar');
    if (userName) {
      this.mensajesService.changeRemitente({ mensajeId: mensaje.id, userName }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.notificationService.success(`El remitente del mensaje ha sido cambiado a ${userName}`, 'Cambiado');
          this.getMensajes();
        }
      });
    }
  }
}

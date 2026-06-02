import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-mensajes',
  templateUrl: './table-mensajes.component.html',
  styleUrls: ['./table-mensajes.component.scss'],
})
export class TableMensajesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public mensajes: any;
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private mensajesService: IHttpMensajesService,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getMensajes();
  }

  getMensajes(): void {
    this.mensajesService.getMensajesAdmin({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          mensaje.eliminado = true;
        }
      });
  }

  changeRemitente(mensaje: any): void {
    const userName = this.notificationService.prompt('Ingresa el nombre de usuario del nuevo remitente de este mensaje, si no existe no se podrá cambiar');
    if (userName) {
      this.mensajesService.changeRemitente({ mensajeId: mensaje.id, userName }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if (response) {
          this.notificationService.success(`El remitente del mensaje ha sido cambiado a ${userName}`, 'Cambiado');
          this.getMensajes();
        }
      });
    }
  }
}

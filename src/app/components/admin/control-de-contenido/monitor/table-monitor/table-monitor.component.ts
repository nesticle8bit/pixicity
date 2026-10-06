import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-monitor',
  templateUrl: './table-monitor.component.html',
  styleUrls: ['./table-monitor.component.scss'],
})
export class TableMonitorComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public monitors: any[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar en notificaciones...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Usuario',
    tipos: [
      { valor: 'no-leidas', label: 'No leídas' },
      { valor: 'Comentario', label: 'Comentarios' },
      { valor: 'Respuestas', label: 'Respuestas' },
      { valor: 'Puntos', label: 'Puntos' },
      { valor: 'Favoritos', label: 'Favoritos' },
      { valor: 'Seguir', label: 'Seguidores' },
      { valor: 'Recomendacion', label: 'Recomendaciones' },
      { valor: 'Mencion', label: 'Menciones' },
      { valor: 'Shout', label: 'Shouts' },
      { valor: 'Rango', label: 'Rangos' },
    ],
  };

  constructor(
    public paginationService: PaginationService,
    private logsService: IHttpLogsService,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getMonitors();
  }

  getMonitors(): void {
    this.cargando = true;
    this.logsService.getMonitorsAdmin(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response?.data) {
        response.data = response.data.map((notificacion: any) => {
          if (notificacion.mensaje) {
            notificacion.mensaje = notificacion.mensaje.replace(
              'tu post',
              `tu ${this.setURL(notificacion, 'post')}`
            );
            notificacion.mensaje = notificacion.mensaje.replace(
              'post que sigues',
              `${this.setURL(notificacion, 'post que sigues')}`
            );
            notificacion.mensaje = notificacion.mensaje.replace(
              'un post',
              `un ${this.setURL(notificacion, 'post')}`
            );
            notificacion.mensaje = notificacion.mensaje.replace(
              'en tu perfil',
              `en tu ${this.setProfile(
                'perfil',
                notificacion.usuario?.userName
              )}`
            );
            notificacion.mensaje = notificacion.mensaje.replace(
              'nuevo Post',
              `nuevo ${this.setURL(notificacion, 'Post')}`
            );
          }

          return notificacion;
        });
      }

      this.monitors = response?.data;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  setURL(notificacion: any, text: string): string {
    console.log(notificacion);
    return `<a href="/posts/${notificacion?.post?.categoria?.seo}/${notificacion.post?.id}/${notificacion.post?.url}" title="${notificacion?.post?.titulo}">${text}</a>`;
  }

  setProfile(text: string, userName: any): string {
    return `<a href='/perfil/${userName}'>${text}</a>`;
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getMonitors();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getMonitors();
  }

  deleteNotificacion(notificacion: any): void {
    const accion = notificacion.eliminado ? 'recuperar' : 'eliminar';
    if (this.notificationService.confirm(`¿Está seguro de ${accion} esta notificación?`)) {
      this.logsService.deleteNotificacion(notificacion.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.notificationService.success(
            `La notificación ha sido ${notificacion.eliminado ? 'recuperada' : 'eliminada'} correctamente`,
            notificacion.eliminado ? 'Recuperada' : 'Eliminada'
          );
          notificacion.eliminado = !notificacion.eliminado;
        }
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-monitor',
  templateUrl: './table-monitor.component.html',
  styleUrls: ['./table-monitor.component.scss'],
})
export class TableMonitorComponent implements OnInit {
  public monitors: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private logsService: IHttpLogsService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getMonitors();
  }

  getMonitors(): void {
    this.logsService.getMonitorsAdmin({}).subscribe((response: any) => {
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

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getMonitors();
  }

  deleteNotificacion(notificacion: any): void {
    Swal.fire({
      title: notificacion.eliminado ? 'Recuperar' : 'Eliminar',
      text: `¿Está seguro de ${
        notificacion.eliminado ? 'recuperar' : 'eliminar'
      } esta notificación?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: notificacion.eliminado ? 'Recuperar' : 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.logsService
          .deleteNotificacion(notificacion.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: notificacion.eliminado ? 'Recuperada' : 'Eliminada',
                text: `La notificación ha sido ${
                  notificacion.eliminado ? 'recuperada' : 'eliminada'
                } correctamente`,
                icon: 'success',
                timer: 3000,
              });

              notificacion.eliminado = !notificacion.eliminado;
            }
          });
      }
    });
  }
}

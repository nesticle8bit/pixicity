import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { MonitorAdmin } from 'src/app/models/admin/filas-admin.model';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { PostUrlLinkComponent } from '../../../../addons/post-url-link/post-url-link.component';
import { UserAvatarComponent } from '../../../../addons/user-avatar/user-avatar.component';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../../../shared/directives/userPopover.directive';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-table-monitor',
    templateUrl: './table-monitor.component.html',
    styleUrls: ['./table-monitor.component.scss'],
    imports: [
        AdminFiltrosComponent,
        NgClass,
        MatTooltip,
        PostUrlLinkComponent,
        UserAvatarComponent,
        RouterLink,
        UserPopoverDirective,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatPaginator,
        TimeAgoPipe,
    ],
})
export class TableMonitorComponent implements OnInit {
  paginationService = inject(PaginationService);
  private logsService = inject(IHttpLogsService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public monitors: MonitorAdmin[] = [];
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
      { valor: 'ComunidadMiembro', label: 'Comunidad: miembros' },
      { valor: 'ComunidadTema', label: 'Comunidad: temas' },
      { valor: 'ComunidadRespuesta', label: 'Comunidad: respuestas' },
      { valor: 'ComunidadVoto', label: 'Comunidad: votos' },
      { valor: 'ComunidadRango', label: 'Comunidad: rangos' },
    ],
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getMonitors();
  }

  getMonitors(): void {
    this.cargando = true;
    this.logsService.getMonitorsAdmin(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response?.data) {
        response.data = response.data.map((notificacion) => {
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

      this.monitors = response?.data ?? [];
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  setURL(notificacion: MonitorAdmin, text: string): string {
    return `<a href="/posts/${notificacion?.post?.categoria?.seo}/${notificacion.post?.id}/${notificacion.post?.url}" title="${notificacion?.post?.titulo}">${text}</a>`;
  }

  setProfile(text: string, userName: string | null | undefined): string {
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

  async deleteNotificacion(notificacion: MonitorAdmin): Promise<void> {
    const accion = notificacion.eliminado ? 'recuperar' : 'eliminar';
    if (await this.notificationService.confirm(`¿Está seguro de ${accion} esta notificación?`)) {
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

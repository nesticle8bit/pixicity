import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { WhoIsIpComponent } from '../../../../addons/who-is-ip/who-is-ip.component';
import { UserPopoverDirective } from '../../../../../shared/directives/userPopover.directive';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../../../../shared/pipes/truncate.pipe';
import { IHttpComentariosPostService } from '../../../../../services/interfaces/httpComentariosPost.interface';

@Component({
    selector: 'app-table-comments',
    templateUrl: './table-comments.component.html',
    styleUrls: ['./table-comments.component.scss'],
    imports: [
        AdminFiltrosComponent,
        NgClass,
        MatTooltip,
        RouterLink,
        WhoIsIpComponent,
        UserPopoverDirective,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatPaginator,
        TimeAgoPipe,
        TruncatePipe,
    ],
})
export class TableCommentsComponent implements OnInit {
  paginationService = inject(PaginationService);
  private comentariosPostService = inject(IHttpComentariosPostService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public comments: any[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar en comentarios, autores o posts...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Autor',
    tipos: [
      { valor: 'respuestas', label: 'Solo respuestas' },
      { valor: 'fijados', label: 'Fijados' },
    ],
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getComentarios();
  }

  getComentarios(): void {
    this.cargando = true;
    this.comentariosPostService.getComentarios(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.comments = response?.data ?? [];
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getComentarios();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getComentarios();
  }

  deleteComentario(comentario: any): void {
    const accion = comentario.eliminado ? 'recuperar' : 'eliminar';
    if (this.notificationService.confirm(`¿Está seguro de ${accion} este comentario?`)) {
      const accion$ = comentario.eliminado
        ? this.comentariosPostService.recuperarComentario(comentario.id)
        : this.comentariosPostService.deleteComentario(comentario.id);
      accion$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.notificationService.success(
            `El comentario ha sido ${comentario.eliminado ? 'recuperado' : 'eliminado'} correctamente`,
            comentario.eliminado ? 'Recuperado' : 'Eliminado'
          );
          comentario.eliminado = !comentario.eliminado;
        }
      });
    }
  }
}

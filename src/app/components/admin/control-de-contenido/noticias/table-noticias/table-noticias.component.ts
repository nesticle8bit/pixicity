import { NoticiaAdmin } from 'src/app/models/admin/filas-admin.model';
import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { DialogCreateUpdateNoticiasComponent } from '../dialog-create-update-noticias/dialog-create-update-noticias.component';
import { IHttpNoticiasService } from 'src/app/services/interfaces/httpNoticias.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { UserAvatarComponent } from '../../../../addons/user-avatar/user-avatar.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-table-noticias',
    templateUrl: './table-noticias.component.html',
    styleUrls: ['./table-noticias.component.scss'],
    imports: [
        AdminFiltrosComponent,
        MatButton,
        MatIcon,
        NgClass,
        MatTooltip,
        UserAvatarComponent,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatPaginator,
        TimeAgoPipe,
        TruncatePipe,
    ],
})
export class TableNoticiasComponent implements OnInit {
  paginationService = inject(PaginationService);
  private noticiasService = inject(IHttpNoticiasService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public noticias: NoticiaAdmin[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar noticias...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Autor',
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getNoticias();
  }

  getNoticias(): void {
    this.cargando = true;
    this.noticiasService.getNoticias('', this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.noticias = response?.noticias;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  updateNoticia(noticia: NoticiaAdmin | null = null): void {
    const dialogRef = this.dialog.open(DialogCreateUpdateNoticiasComponent, {
      width: '1080px',
      data: noticia,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.getNoticias();
      }
    });
  }

  deleteNoticia(noticia: NoticiaAdmin): void {
    const accion = noticia.eliminado ? 'recuperar' : 'eliminar';
    if (this.notificationService.confirm(`¿Está seguro de ${accion} esta noticia?`)) {
      this.noticiasService.deleteNoticias(noticia.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.notificationService.success(
            `La noticia ha sido ${noticia.eliminado ? 'recuperada' : 'eliminada'} correctamente`,
            noticia.eliminado ? 'Recuperada' : 'Eliminada'
          );
          noticia.eliminado = !noticia.eliminado;
        }
      });
    }
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getNoticias();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getNoticias();
  }
}

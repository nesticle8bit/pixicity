import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { DialogCreateUpdateNoticiasComponent } from '../dialog-create-update-noticias/dialog-create-update-noticias.component';
import { IHttpNoticiasService } from 'src/app/services/interfaces/httpNoticias.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-noticias',
  templateUrl: './table-noticias.component.html',
  styleUrls: ['./table-noticias.component.scss'],
})
export class TableNoticiasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public noticias: any[] = [];
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

  constructor(
    public paginationService: PaginationService,
    private noticiasService: IHttpNoticiasService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
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

  updateNoticia(noticia: any = null): void {
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

  deleteNoticia(noticia: any): void {
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

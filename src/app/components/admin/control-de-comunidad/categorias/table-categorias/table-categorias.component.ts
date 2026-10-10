import { NotificationService } from 'src/app/services/shared/notification.service';
import { CategoriaAdmin } from 'src/app/models/admin/filas-admin.model';
import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { DialogCreateUpdateCategoriasComponent } from '../dialog-create-update-categorias/dialog-create-update-categorias.component';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass, DatePipe } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-table-categorias',
    templateUrl: './table-categorias.component.html',
    styleUrls: ['./table-categorias.component.scss'],
    imports: [
        AdminFiltrosComponent,
        MatButton,
        MatIcon,
        MatTooltip,
        NgClass,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatPaginator,
        DatePipe,
        TimeAgoPipe,
    ],
})
export class TableCategoriasComponent implements OnInit {
  paginationService = inject(PaginationService);
  private parametrosService = inject(IHttpParametrosService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public categorias: CategoriaAdmin[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = { placeholder: 'Buscar categorías...' };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.cargando = true;
    this.parametrosService.getCategoriasAdmin(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.categorias = response.categorias ?? [];
      this.totalCount = response.pagination.totalCount;
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getCategorias();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getCategorias();
  }

  updateCategoria(categoria?: CategoriaAdmin): void {
    const dialogRef = this.dialog.open(DialogCreateUpdateCategoriasComponent, {
      width: '1280px',
      data: categoria,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.getCategorias();
      }
    });
  }

  /** Alterna eliminada/activa: una categoría eliminada no se ofrece al crear posts, pero sus posts siguen visibles. */
  cambiarEstado(categoria: CategoriaAdmin): void {
    const accion = categoria.eliminado ? 'recuperar' : 'eliminar';
    if (!this.notificationService.confirm(`¿Seguro que deseas ${accion} la categoría "${categoria.nombre}"?`)) return;

    this.parametrosService.cambiarEstadoCategoria(categoria.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((eliminada) => {
      categoria.eliminado = eliminada;
      this.notificationService.success(
        eliminada ? 'La categoría ya no se ofrece al crear posts' : 'La categoría vuelve a estar disponible',
        eliminada ? 'Eliminada' : 'Recuperada',
      );
    });
  }
}

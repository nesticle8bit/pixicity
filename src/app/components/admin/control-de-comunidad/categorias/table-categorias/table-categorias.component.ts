import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { DialogCreateUpdateCategoriasComponent } from '../dialog-create-update-categorias/dialog-create-update-categorias.component';

@Component({
  standalone: false,
  selector: 'app-table-categorias',
  templateUrl: './table-categorias.component.html',
  styleUrls: ['./table-categorias.component.scss'],
})
export class TableCategoriasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public categorias: any[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = { placeholder: 'Buscar categorías...' };

  constructor(
    public paginationService: PaginationService,
    private parametrosService: IHttpParametrosService,
    private dialog: MatDialog
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.cargando = true;
    this.parametrosService.getCategoriasAdmin(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.categorias = response.categorias;
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

  updateCategoria(categoria: any): void {
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

  deleteCategoria(categoriaId: number, index: number): void {

  }
}

import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-fotos',
  templateUrl: './table-fotos.component.html',
  styleUrls: ['./table-fotos.component.scss'],
})
export class TableFotosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public fotos: any[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar fotos o autores...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Autor',
  };

  constructor(
    public paginationService: PaginationService,
    private fotosService: IHttpFotosService,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getFotos();
  }

  getFotos(): void {
    this.cargando = true;
    this.fotosService
      .getFotosAdmin({ page: this.paginationService.page, pageCount: this.paginationService.pageCount }, this.filtro)
      .pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.fotos = response.data;
        this.totalCount = response.pagination.totalCount;
      });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getFotos();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getFotos();
  }

  eliminarFoto(fotoId: number, index: number): void {
    if (this.notificationService.confirm('¿Seguro que deseas borrar esta foto?')) {
      this.fotosService
        .deleteFoto(fotoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response: boolean) => {
          if (response) {
            this.notificationService.success('La foto ha sido eliminada correctamente, ahora nadie la podrá visualizar', 'Eliminada');
            this.fotos[index].eliminado = true;
          }
        });
    }
  }
}

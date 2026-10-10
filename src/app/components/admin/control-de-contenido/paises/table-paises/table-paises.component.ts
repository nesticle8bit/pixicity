import { PaisAdmin } from 'src/app/models/admin/filas-admin.model';
import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { DialogUpdatePaisesComponent } from '../dialog-update-paises/dialog-update-paises.component';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { NgClass, UpperCasePipe } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-table-paises',
    templateUrl: './table-paises.component.html',
    styleUrls: ['./table-paises.component.scss'],
    imports: [
        AdminFiltrosComponent,
        NgClass,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatPaginator,
        UpperCasePipe,
        TimeAgoPipe,
    ],
})
export class TablePaisesComponent implements OnInit {
  paginationService = inject(PaginationService);
  private parametrosService = inject(IHttpParametrosService);
  private dialog = inject(MatDialog);

  private readonly destroyRef = inject(DestroyRef);

  public paises: PaisAdmin[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar países o códigos ISO...',
    estado: true,
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getPaises();
  }

  getPaises(): void {
    this.cargando = true;
    this.parametrosService.getPaises(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if(response.data) {
        response.data = response.data.map((pais: PaisAdmin) => {
          pais.iso2 = pais.iso2?.toLowerCase();
          return pais;
        });
      }

      this.paises = response?.data ?? [];
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  updatePais(index: number): void {
    const pais = this.paises[index];

    const dialogRef = this.dialog.open(DialogUpdatePaisesComponent, {
      width: '600px',
      data: pais,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.getPaises();
      }
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getPaises();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPaises();
  }
}

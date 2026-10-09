import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { CensuraViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { DialogCreateUpdateCensurasComponent } from '../dialog-create-update-censuras/dialog-create-update-censuras.component';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-table-censuras',
    templateUrl: './table-censuras.component.html',
    styleUrls: ['./table-censuras.component.scss'],
    imports: [
        AdminFiltrosComponent,
        MatButton,
        MatIcon,
        MatTooltip,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatPaginator,
        DatePipe,
        TimeAgoPipe,
    ],
})
export class TableCensurasComponent implements OnInit {
  paginationService = inject(PaginationService);
  private parametrosService = inject(IHttpParametrosService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  private readonly destroyRef = inject(DestroyRef);

  public censuras: CensuraViewModel[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar palabras...',
    fechas: true,
    orden: true,
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getCensuras();
  }

  getCensuras(): void {
    this.cargando = true;
    this.parametrosService.getCensuras(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.censuras = response?.data ?? [];
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  upsertCensura(censura?: CensuraViewModel): void {
    const dialogRef = this.dialog.open(DialogCreateUpdateCensurasComponent, {
      width: '600px',
      data: censura,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.getCensuras();
      }
    });
  }

  deleteCensura(censura: CensuraViewModel, index: number): void {
    if (!censura.id) return;

    if (!this.notificationService.confirm(`¿Eliminar la palabra censurada "${censura.palabra}"?`)) {
      return;
    }

    this.parametrosService.deleteCensura(censura.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: boolean) => {
      if (response) {
        this.notificationService.success('La palabra ha sido eliminada de la lista de censura', 'Eliminada');
        this.censuras.splice(index, 1);
      }
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getCensuras();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getCensuras();
  }
}

import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { DialogAddUpdateRangoComponent } from 'src/app/components/dialogs/dialog-add-update-rango/dialog-add-update-rango.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DialogRangosChangesReportComponent } from '../dialog-rangos-changes-report/dialog-rangos-changes-report.component';
import { DialogVerUsuariosComponent } from 'src/app/components/dialogs/dialog-ver-usuarios/dialog-ver-usuarios.component';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NgStyle, DatePipe } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';
import { IHttpRangosService } from '../../../../../services/interfaces/httpRangos.interface';

@Component({
    selector: 'app-table-rangos',
    templateUrl: './table-rangos.component.html',
    styleUrls: ['./table-rangos.component.scss'],
    imports: [
        AdminFiltrosComponent,
        MatButton,
        MatIcon,
        MatTooltip,
        NgStyle,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatPaginator,
        DatePipe,
        TimeAgoPipe,
    ],
})
export class TableRangosComponent implements OnInit {
  paginationService = inject(PaginationService);
  private rangosService = inject(IHttpRangosService);
  private dialog = inject(MatDialog);

  private readonly destroyRef = inject(DestroyRef);

  public rangos: any[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = { placeholder: 'Buscar rangos...' };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getRangos();
  }

  getRangos(): void {
    this.cargando = true;
    this.rangosService.getRangosUsuarios(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.rangos = response?.rangos ?? [];
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getRangos();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getRangos();
  }

  addRango(): void {
    const dialogRef = this.dialog.open(DialogAddUpdateRangoComponent, {
      width: '580px',
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: number) => {
      if (value) {
        this.getRangos();
      }
    });
  }

  updateRango(rango: any): void {
    const dialogRef = this.dialog.open(DialogAddUpdateRangoComponent, {
      width: '580px',
      data: rango,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: number) => {
      if (value) {
        this.getRangos();
      }
    });
  }

  deleteRango(id: number): void {}

  updateRangoUsuarios(): void {
    this.rangosService
      .changeUsuariosRangosByPuntos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if ((response?.length ?? 0) > 0) {
          this.dialog.open(DialogRangosChangesReportComponent, {
            width: '980px',
            data: response,
            disableClose: true,
          });
        }
      });
  }

  verUsuariosConRango(rangoId: number): void {
    this.dialog.open(DialogVerUsuariosComponent, {
      width: '1200px',
      disableClose: true,
      data: {
        rangoId,
      },
    });
  }
}

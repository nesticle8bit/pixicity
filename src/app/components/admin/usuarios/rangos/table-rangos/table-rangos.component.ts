import { DialogAddUpdateRangoComponent } from 'src/app/components/dialogs/dialog-add-update-rango/dialog-add-update-rango.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DialogRangosChangesReportComponent } from '../dialog-rangos-changes-report/dialog-rangos-changes-report.component';
import { DialogVerUsuariosComponent } from 'src/app/components/dialogs/dialog-ver-usuarios/dialog-ver-usuarios.component';

@Component({
  standalone: false,
  selector: 'app-table-rangos',
  templateUrl: './table-rangos.component.html',
  styleUrls: ['./table-rangos.component.scss'],
})
export class TableRangosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public rangos: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService,
    private dialog: MatDialog
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getRangos();
  }

  getRangos(): void {
    this.securityService.getRangosUsuarios().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.rangos = response?.rangos;
      this.totalCount = response?.pagination?.totalCount;
    });
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
    this.securityService
      .changeUsuariosRangosByPuntos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response?.length > 0) {
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

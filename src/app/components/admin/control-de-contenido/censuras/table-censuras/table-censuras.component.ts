import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { DialogCreateUpdateCensurasComponent } from '../dialog-create-update-censuras/dialog-create-update-censuras.component';

@Component({
  standalone: false,
  selector: 'app-table-censuras',
  templateUrl: './table-censuras.component.html',
  styleUrls: ['./table-censuras.component.scss'],
})
export class TableCensurasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public censuras: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private parametrosService: IHttpParametrosService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getCensuras();
  }

  getCensuras(): void {
    this.parametrosService.getCensuras().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.censuras = response?.data;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  upsertCensura(censura?: any): void {
    const dialogRef = this.dialog.open(DialogCreateUpdateCensurasComponent, {
      width: '600px',
      data: censura,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      if (value) {
        this.getCensuras();
      }
    });
  }

  deleteCensura(censura: any, index: number): void {
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

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getCensuras();
  }
}

import { DialogVerReporteComponent } from '../dialog-ver-reporte/dialog-ver-reporte.component';
import { IHttpDenunciasService } from 'src/app/services/interfaces/httpDenuncias.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-reportes',
  templateUrl: './table-reportes.component.html',
  styleUrls: ['./table-reportes.component.scss'],
})
export class TableReportesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public denuncias: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private denunciaService: IHttpDenunciasService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getDenuncias();
  }

  getDenuncias(): void {
    this.denunciaService.getDenuncias().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.denuncias = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getDenuncias();
  }

  deleteReporte(denuncia: any): void {
    if (this.notificationService.confirm('¿Está seguro de eliminar esta denuncia?')) {
      this.denunciaService.deleteDenuncia(denuncia.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('La denuncia ha sido eliminada correctamente', 'Eliminado');
          denuncia.eliminado = !denuncia.eliminado;
        }
      });
    }
  }

  verReporte(denuncia: any): void {
    this.dialog.open(DialogVerReporteComponent, {
      width: '980px',
      disableClose: true,
      data: denuncia,
    });
  }
}

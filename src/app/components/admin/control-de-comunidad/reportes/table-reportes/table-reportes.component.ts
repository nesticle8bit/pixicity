import { DialogVerReporteComponent } from '../dialog-ver-reporte/dialog-ver-reporte.component';
import { IHttpDenunciasService } from 'src/app/services/interfaces/httpDenuncias.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-reportes',
  templateUrl: './table-reportes.component.html',
  styleUrls: ['./table-reportes.component.scss'],
})
export class TableReportesComponent implements OnInit {
  public denuncias: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private denunciaService: IHttpDenunciasService,
    private dialog: MatDialog
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnInit(): void {
    this.getDenuncias();
  }

  getDenuncias(): void {
    this.denunciaService.getDenuncias().subscribe((response: any) => {
      this.denuncias = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getDenuncias();
  }

  deleteReporte(denuncia: any): void {
    Swal.fire({
      title: 'Eliminar',
      text: `¿Está seguro de eliminar esta denuncia?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.denunciaService
          .deleteDenuncia(denuncia.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Eliminado',
                text: `La denuncia ha sido eliminada correctamente`,
                icon: 'success',
                timer: 3000,
              });

              denuncia.eliminado = !denuncia.eliminado;
            }
          });
      }
    });
  }

  verReporte(denuncia: any): void {
    this.dialog.open(DialogVerReporteComponent, {
      width: '980px',
      disableClose: true,
      data: denuncia,
    });
  }
}

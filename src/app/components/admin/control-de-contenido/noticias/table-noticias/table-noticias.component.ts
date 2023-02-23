import { IHttpNoticiasService } from 'src/app/services/interfaces/httpNoticias.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { DialogCreateUpdateNoticiasComponent } from '../dialog-create-update-noticias/dialog-create-update-noticias.component';

@Component({
  selector: 'app-table-noticias',
  templateUrl: './table-noticias.component.html',
  styleUrls: ['./table-noticias.component.scss'],
})
export class TableNoticiasComponent implements OnInit {
  public noticias: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private noticiasService: IHttpNoticiasService,
    private dialog: MatDialog
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getNoticias();
  }

  getNoticias(): void {
    this.noticiasService.getNoticias('').subscribe((response: any) => {
      if (response?.data) {
        this.noticias = response?.data;
        this.totalCount = response?.pagination?.totalCount;
      }
    });
  }

  updateNoticia(noticia: any = null): void {
    const dialogRef = this.dialog.open(DialogCreateUpdateNoticiasComponent, {
      width: '1080px',
      data: noticia,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value) {
        this.getNoticias();
      }
    });
  }

  deleteNoticia(noticia: any): void {
    Swal.fire({
      title: noticia.eliminado ? 'Recuperar' : 'Eliminar',
      text: `¿Está seguro de ${
        noticia.eliminado ? 'recuperar' : 'eliminar'
      } esta noticia?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: noticia.eliminado ? 'Recuperar' : 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.noticiasService
          .deleteNoticias(noticia.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: noticia.eliminado ? 'Recuperada' : 'Eliminada',
                text: `La noticia ha sido ${
                  noticia.eliminado ? 'recuperada' : 'eliminada'
                } correctamente`,
                icon: 'success',
                timer: 3000,
              });

              noticia.eliminado = !noticia.eliminado;
            }
          });
      }
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getNoticias();
  }
}

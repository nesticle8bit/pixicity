import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-comments',
  templateUrl: './table-comments.component.html',
  styleUrls: ['./table-comments.component.scss'],
})
export class TableCommentsComponent implements OnInit {
  public comments: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postsService: IHttpPostsService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getComentarios();
  }

  getComentarios(): void {
    this.postsService.getComentarios().subscribe((response: any) => {
      this.comments = response?.data;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getComentarios();
  }

  deleteComentario(comentario: any): void {
    Swal.fire({
      title: comentario.eliminado ? 'Recuperar' : 'Eliminar',
      text: `¿Está seguro de ${
        comentario.eliminado ? 'recuperar' : 'eliminar'
      } este comentario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: comentario.eliminado ? 'Recuperar' : 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.postsService
          .deleteComentario(comentario.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: comentario.eliminado ? 'Recuperado' : 'Eliminado',
                text: `El comentario ha sido ${
                  comentario.eliminado ? 'recuperado' : 'eliminado'
                } correctamente`,
                icon: 'success',
                timer: 3000,
              });

              comentario.eliminado = !comentario.eliminado;
            }
          });
      }
    });
  }
}

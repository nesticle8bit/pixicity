import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-comments',
  templateUrl: './table-comments.component.html',
  styleUrls: ['./table-comments.component.scss'],
})
export class TableCommentsComponent implements OnInit {
  public comments: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postsService: IHttpPostsService,
    private notificationService: NotificationService
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
    const accion = comentario.eliminado ? 'recuperar' : 'eliminar';
    if (this.notificationService.confirm(`¿Está seguro de ${accion} este comentario?`)) {
      this.postsService.deleteComentario(comentario.id).subscribe((response: any) => {
        if (response) {
          this.notificationService.success(
            `El comentario ha sido ${comentario.eliminado ? 'recuperado' : 'eliminado'} correctamente`,
            comentario.eliminado ? 'Recuperado' : 'Eliminado'
          );
          comentario.eliminado = !comentario.eliminado;
        }
      });
    }
  }
}

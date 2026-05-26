import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-posts',
  templateUrl: './table-posts.component.html',
  styleUrls: ['./table-posts.component.scss'],
})
export class TablePostsComponent implements OnInit {
  public posts: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postsService: IHttpPostsService,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getPosts();
  }

  getPosts(): void {
    this.postsService.getPostsAdmin('').subscribe((response: any) => {
      this.posts = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPosts();
  }

  cambiarSticky(postId: number, index: number): void {
    this.postsService.changeStickyPost(postId).subscribe((response: any) => {
      if (response) {
        this.notificationService.success('Se ha cambiado el sticky para este post correctamente', 'Sticky');
        this.posts[index].sticky = !this.posts[index].sticky;
      }
    });
  }

  eliminarPost(postId: number, index: number): void {
    if (this.notificationService.confirm('¿Seguro que deseas borrar este post?')) {
      const razon = this.notificationService.prompt('Ingrese por favor la razón por la cual va a eliminar este post');
      if (razon) {
        this.postsService.deletePost(postId, razon).subscribe((response: boolean) => {
          if (response) {
            this.notificationService.success('El post ha sido eliminado correctamente, ahora nadie lo podrá visualizar', 'Eliminado');
            this.posts[index].eliminado = !this.posts[index].eliminado;
          }
        });
      }
    }
  }
}

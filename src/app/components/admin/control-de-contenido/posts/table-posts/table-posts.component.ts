import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-posts',
  templateUrl: './table-posts.component.html',
  styleUrls: ['./table-posts.component.scss'],
})
export class TablePostsComponent implements OnInit {
  public posts: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postsService: IHttpPostsService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
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
        Swal.fire({
          title: 'Sticky',
          text: 'Se ha cambiado el sticky para este post correctamente',
          icon: 'success',
          timer: 3000,
        });

        this.posts[index].sticky = !this.posts[index].sticky;
      }
    });
  }

  eliminarPost(postId: number, index: number): void {
    Swal.fire({
      title: 'Borrar Post',
      text: '¿Seguro que deseas borrar este post?',
      showCancelButton: true,
      confirmButtonText: `Borrar`,
      cancelButtonText: `Cancelar`,
      icon: 'question',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title:
            'Ingrese por favor la razón por la cual va a eliminar este post',
          input: 'text',
          inputAttributes: {
            autocapitalize: 'on',
          },
          showCancelButton: true,
          confirmButtonText: 'Eliminar',
          cancelButtonText: `Cancelar`,
          showLoaderOnConfirm: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.postsService
              .deletePost(postId, result.value)
              .subscribe((response: boolean) => {
                if (response) {
                  Swal.fire({
                    title: 'Eliminado',
                    text: 'El post ha sido eliminado correctamente, ahora nadie lo podrá visualizar',
                    icon: 'success',
                    timer: 3000,
                  });

                  this.posts[index].eliminado = !this.posts[index].eliminado;
                }
              });
          }
        });
      }
    });
  }
}

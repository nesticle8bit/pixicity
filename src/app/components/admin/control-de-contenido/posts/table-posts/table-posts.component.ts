import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-posts',
  templateUrl: './table-posts.component.html',
  styleUrls: ['./table-posts.component.scss'],
})
export class TablePostsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public posts: any[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar por título, etiquetas, categoría o autor...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Autor',
    tipos: [
      { valor: 'privados', label: 'Privados' },
      { valor: 'sticky', label: 'Sticky' },
      { valor: 'borradores', label: 'Borradores' },
      { valor: 'sin-comentarios', label: 'Comentarios cerrados' },
    ],
  };

  constructor(
    public paginationService: PaginationService,
    private postsService: IHttpPostsService,
    private notificationService: NotificationService,
    private parametrosService: IHttpParametrosService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getPosts();
    // Categorías para el filtro avanzado (se asigna un objeto nuevo para que el componente de filtros lo note).
    this.parametrosService
      .getCategoriasDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categorias) => (this.filtrosConfig = { ...this.filtrosConfig, categorias: categorias ?? [] }));
  }

  getPosts(): void {
    this.cargando = true;
    this.postsService.getPostsAdmin('', this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.posts = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getPosts();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPosts();
  }

  cambiarSticky(postId: number, index: number): void {
    this.postsService.changeStickyPost(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
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
        this.postsService.deletePost(postId, razon).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: boolean) => {
          if (response) {
            this.notificationService.success('El post ha sido eliminado correctamente, ahora nadie lo podrá visualizar', 'Eliminado');
            this.posts[index].eliminado = !this.posts[index].eliminado;
          }
        });
      }
    }
  }
}

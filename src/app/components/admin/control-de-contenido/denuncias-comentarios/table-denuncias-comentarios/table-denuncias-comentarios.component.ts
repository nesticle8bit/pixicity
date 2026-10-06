import { Component, inject } from '@angular/core';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { FuenteDenuncias } from '../../../shared/table-denuncias/table-denuncias.component';

@Component({
  standalone: false,
  selector: 'app-table-denuncias-comentarios',
  template: `
    <app-table-denuncias [fuente]="fuente" columnaOrigen="Post">
      <ng-template #origen let-comentario>
        @if (comentario.postId) {
          <app-post-url-link
            [post]="{ id: comentario.postId, url: comentario.postUrl, titulo: comentario.postTitulo, truncate: 60 }"
            [categoria]="{ icono: comentario.categoria?.icono, nombre: comentario.categoria?.nombre, seo: comentario.categoria?.seo }">
          </app-post-url-link>
        } @else {
          <span class="text-muted">—</span>
        }
      </ng-template>
    </app-table-denuncias>
  `,
})
export class TableDenunciasComentariosComponent {
  private readonly postService = inject(IHttpPostsService);

  readonly fuente: FuenteDenuncias = {
    listar: (page, pageCount, soloPendientes) => this.postService.getDenunciasComentarios(page, pageCount, soloPendientes),
    resolver: (id) => this.postService.resolverDenunciaComentario(id),
    eliminar: (id) => this.postService.eliminarDenunciaComentario(id),
    borrarComentario: (id) => this.postService.deleteComentario(id),
  };
}

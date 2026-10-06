import { Component, inject } from '@angular/core';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { FuenteDenuncias } from '../../../shared/table-denuncias/table-denuncias.component';

@Component({
  standalone: false,
  selector: 'app-table-denuncias-shouts',
  template: `
    <app-table-denuncias [fuente]="fuente" columnaOrigen="Shout" campoTexto="comentario"
      mensajeVacio="No hay denuncias de comentarios de shouts.">
      <ng-template #origen let-comentario>
        @if (comentario.shoutId) {
          <a [routerLink]="['/shouts', comentario.shoutOwner, comentario.shoutId]" target="_blank">
            Shout #{{comentario.shoutId}}
            <small class="text-muted d-block">de {{comentario.shoutOwner}}</small>
          </a>
        } @else {
          <span class="text-muted">—</span>
        }
      </ng-template>
    </app-table-denuncias>
  `,
})
export class TableDenunciasShoutsComponent {
  private readonly perfilService = inject(IHttpPerfilService);

  readonly fuente: FuenteDenuncias = {
    listar: (page, pageCount, soloPendientes) => this.perfilService.getDenunciasShoutComentarios(page, pageCount, soloPendientes),
    resolver: (id) => this.perfilService.resolverDenunciaShoutComentario(id),
    eliminar: (id) => this.perfilService.eliminarDenunciaShoutComentario(id),
    borrarComentario: (id) => this.perfilService.deleteShoutComentario(id),
  };
}

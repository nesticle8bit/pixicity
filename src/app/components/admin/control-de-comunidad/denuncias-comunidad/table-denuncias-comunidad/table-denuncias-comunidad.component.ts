import { Component, inject } from '@angular/core';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { FuenteDenuncias } from '../../../shared/table-denuncias/table-denuncias.component';

@Component({
  standalone: false,
  selector: 'app-table-denuncias-comunidad',
  template: `
    <app-table-denuncias [fuente]="fuente" columnaOrigen="Comunidad / Tema">
      <ng-template #origen let-comentario>
        @if (comentario.temaId) {
          <a [routerLink]="['/comunidades', comentario.comunidad?.nombreCorto, 'tema', comentario.temaId, comentario.temaUrl]"
            target="_blank" [title]="comentario.temaTitulo">
            <small class="text-muted d-block">{{comentario.comunidad?.nombre}}</small>
            {{comentario.temaTitulo}}
          </a>
        } @else {
          <span class="text-muted">—</span>
        }
      </ng-template>
    </app-table-denuncias>
  `,
})
export class TableDenunciasComunidadComponent {
  private readonly comunidadesService = inject(IHttpComunidadesService);

  readonly fuente: FuenteDenuncias = {
    listar: (page, pageCount, soloPendientes) => this.comunidadesService.getDenunciasComentarios(page, pageCount, soloPendientes),
    resolver: (id) => this.comunidadesService.resolverDenunciaComentario(id),
    eliminar: (id) => this.comunidadesService.eliminarDenunciaComentario(id),
    borrarComentario: (id) => this.comunidadesService.eliminarComentario(id),
  };
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { ContenidoSeoPipe } from 'src/app/shared/pipes/contenidoSeo.pipe';
import { EnlazarHashtagsPipe } from 'src/app/shared/pipes/enlazarHashtags.pipe';
import { ContenidoPostDirective } from 'src/app/shared/directives/contenido-post.directive';
import { minutosDeLectura } from 'src/app/shared/helpers/contenido-post';

export interface PrevisualizarPostData {
  titulo: string;
  contenido: string;
}

/** El post tal como se verá publicado (mismos estilos y mejoras que la vista del post). */
@Component({
  selector: 'app-dialog-previsualizar-post',
  templateUrl: './dialog-previsualizar-post.component.html',
  styleUrls: ['./dialog-previsualizar-post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose,
    ContenidoSeoPipe, EnlazarHashtagsPipe, ContenidoPostDirective,
  ],
})
export class DialogPrevisualizarPostComponent {
  readonly data = inject<PrevisualizarPostData>(MAT_DIALOG_DATA);
  readonly minutos = minutosDeLectura(this.data.contenido);
}

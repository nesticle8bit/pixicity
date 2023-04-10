import { DialogDisplayHistoryCommentsComponent } from 'src/app/components/dialogs/dialog-display-history-comments/dialog-display-history-comments.component';
import { BottomSheetsEmojisComponent } from 'src/app/components/bottom-sheets/bottom-sheets-emojis/bottom-sheets-emojis.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss'],
})
export class PostCommentsComponent implements OnInit {
  public commented: boolean = false;
  private _post: any;

  @Input() set post(value: any) {
    this._post = value;
    this.getComentariosByPostId();
  }

  get post(): any {
    return this._post;
  }

  public formGroup: FormGroup;
  public comentarios: any = [];
  public currentUser: any;
  public displayEmojis: boolean = false;

  constructor(
    private securityService: IHttpSecurityService,
    private postService: IHttpPostsService,
    private bottomSheet: MatBottomSheet,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.formGroup = this.formBuilder.group({
      contenido: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  enviarComentario(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const comentario = Object.assign({}, this.formGroup.value);
    comentario.postId = this.post?.id;
    comentario.respuestas = [];

    this.postService.addComentario(comentario).subscribe((response: any) => {
      if (response) {
        this.formGroup.patchValue({
          contenido: '',
        });

        this.comentarios.push({
          id: response,
          usuario: this.currentUser.usuario.userName,
          avatar: this.currentUser.usuario.avatar,
          contenido: comentario.contenido,
          fechaComentario: new Date(),
        });

        this.commented = true;
      }
    });
  }

  getComentariosByPostId(): void {
    this.postService
      .getComentariosByPostId(this.post.id)
      .subscribe((response: any) => {
        this.comentarios = response;
      });
  }

  respuesta(respuesta: any): void {
    if (!respuesta?.respuesta) {
      return;
    }

    let comentario = {
      id: 0,
      postId: this.post?.id,
      comentarioId: respuesta.id,
      contenido: respuesta.respuesta,
      usuario: undefined,
      avatar: undefined,
      fechaComentario: new Date(),
    };

    this.postService.addComentario(comentario).subscribe((response: any) => {
      if (response) {
        comentario.id = response;
        comentario.usuario = this.currentUser.usuario.userName;
        comentario.avatar = this.currentUser.usuario.avatar;

        if (!respuesta.respuestas) {
          respuesta.respuestas = [];
        }

        respuesta.respuestas.push(comentario);
        respuesta.responder = false;
      }
    });
  }

  eliminarComentario(comentarioId: any, i: number): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Estás seguro de eliminar este comentario? Recuerda que no se podrá recuperar',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService
          .deleteComentario(comentarioId)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Eliminado',
                text: `El comentario ha sido eliminado correctamente`,
                icon: 'success',
                timer: 3000,
              });

              this.comentarios.splice(i, 1);
            }
          });
      }
    });
  }

  eliminarRespuesta(respuestaId: any, comentario: number, i: number): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Estás seguro de eliminar esta respuesta? Recuerda que no se podrá recuperar',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService
          .deleteComentario(respuestaId)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Eliminado',
                text: `La respuesta ha sido eliminado correctamente`,
                icon: 'success',
                timer: 3000,
              });

              const comment = this.comentarios[comentario];

              if (comment && comment?.respuestas) {
                this.comentarios[comentario].respuestas.splice(i, 1);
              }
            }
          });
      }
    });
  }

  addEmoji(event: any): void {
    const comentario = this.formGroup.value.contenido;

    this.formGroup.patchValue({
      contenido: `${comentario}${event.emoji.native}`,
    });
  }

  emojiBottomSheet(): void {
    // displayEmojis = !displayEmojis
    const ref = this.bottomSheet.open(BottomSheetsEmojisComponent, {
      closeOnNavigation: true,
    });

    ref.afterDismissed().subscribe((value: any) => {
      if (value) {
        this.addEmoji(value);
      }
    });
  }

  public lastComment: string = '';
  updateComentario(comentario: any): void {
    if (!comentario) {
      return;
    }

    if (!comentario.contenido) {
      return;
    }

    const updateComentario = {
      id: comentario.id,
      contenido: comentario.contenido,
    };

    this.postService
      .updateComentario(updateComentario)
      .subscribe((response: any) => {
        if (response) {
          comentario.update = false;

          if (!comentario.historial) {
            comentario.historial = [];
          }

          comentario.historial.unshift({
            fecha: new Date(),
            contenido: this.lastComment,
          });

          this.lastComment = '';
        }
      });
  }

  displayHistory(comentario: any): void {
    if (comentario.historial?.length < 1) {
      return;
    }

    this.dialog.open(DialogDisplayHistoryCommentsComponent, {
      width: '700px',
      data: comentario.historial,
    });
  }
}

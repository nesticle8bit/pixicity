import { DialogDisplayHistoryCommentsComponent } from 'src/app/components/dialogs/dialog-display-history-comments/dialog-display-history-comments.component';
import { BottomSheetsEmojisComponent } from 'src/app/components/bottom-sheets/bottom-sheets-emojis/bottom-sheets-emojis.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/shared/notification.service';

// Motivos de denuncia predefinidos (el usuario puede elegir número o escribir el suyo)
const MOTIVOS_DENUNCIA = ['Spam o publicidad', 'Contenido ofensivo', 'Acoso', 'Información falsa', 'Contenido sexual', 'Otro'];

@Component({
  standalone: false,
  selector: 'app-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss'],
})
export class PostCommentsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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

  // Orden de los comentarios raíz (estilo Reddit)
  public orden: 'mejores' | 'recientes' | 'controvertido' = 'mejores';
  // Puntaje por debajo del cual el comentario se colapsa
  private readonly UMBRAL_COLAPSO = -5;
  // Denuncias pendientes a partir de las cuales el comentario se auto-oculta
  public readonly UMBRAL_DENUNCIAS = 3;

  constructor(
    private securityService: IHttpSecurityService,
    private postService: IHttpPostsService,
    private bottomSheet: MatBottomSheet,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private notificationService: NotificationService
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

    this.postService.addComentario(comentario).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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
          votos: 0,
          miVoto: 0,
          respuestas: [],
        });

        this.ordenar();
        this.commented = true;
      }
    });
  }

  getComentariosByPostId(): void {
    this.postService
      .getComentariosByPostId(this.post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        this.comentarios = response ?? [];
        this.ordenar();
      });
  }

  cambiarOrden(orden: 'mejores' | 'recientes' | 'controvertido'): void {
    if (this.orden === orden) return;
    this.orden = orden;
    this.ordenar();
  }

  private controversia(c: any): number {
    return Math.min(c.votosArriba || 0, c.votosAbajo || 0);
  }

  private totalVotos(c: any): number {
    return (c.votosArriba || 0) + (c.votosAbajo || 0);
  }

  private ordenar(): void {
    const arr = this.comentarios || [];
    if (this.orden === 'mejores') {
      arr.sort((a: any, b: any) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0)
        || (b.votos || 0) - (a.votos || 0)
        || new Date(b.fechaComentario).getTime() - new Date(a.fechaComentario).getTime());
    } else if (this.orden === 'controvertido') {
      arr.sort((a: any, b: any) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0)
        || this.controversia(b) - this.controversia(a)
        || this.totalVotos(b) - this.totalVotos(a)
        || new Date(b.fechaComentario).getTime() - new Date(a.fechaComentario).getTime());
    } else {
      arr.sort((a: any, b: any) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0)
        || new Date(b.fechaComentario).getTime() - new Date(a.fechaComentario).getTime());
    }
    this.marcarDestacado();
  }

  private marcarDestacado(): void {
    const arr = this.comentarios || [];
    arr.forEach((c: any) => (c.destacado = false));
    const top = arr.reduce((best: any, c: any) => ((c.votos || 0) > (best?.votos || 0) ? c : best), null);
    if (top && (top.votos || 0) >= 3) top.destacado = true;
  }

  estaColapsado(c: any): boolean {
    if (c._mostrar) return false;
    return (c.votos || 0) <= this.UMBRAL_COLAPSO || (c.denunciasPendientes || 0) >= this.UMBRAL_DENUNCIAS;
  }

  mostrarColapsado(c: any): void {
    c._mostrar = true;
  }

  esComentarioPropio(c: any): boolean {
    return c?.usuario === this.currentUser?.usuario?.userName;
  }

  get esModerador(): boolean {
    const rango = this.currentUser?.usuario?.rango;
    return rango === 'Administrador' || rango === 'Moderador';
  }

  puedeFijar(c: any): boolean {
    // Solo comentarios raíz; dueño del post o mod/admin
    if (c?.comentarioId) return false;
    return this.esModerador || this.post?.usuario?.userName === this.currentUser?.usuario?.userName;
  }

  fijar(c: any): void {
    this.postService.fijarComentario(c.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fijado: any) => {
        c.fijado = fijado;
        this.notificationService.success(fijado ? 'Comentario fijado' : 'Comentario desfijado', 'Comentarios');
        this.ordenar();
      },
      error: () => {},
    });
  }

  denunciar(c: any): void {
    if (!this.currentUser?.usuario) {
      this.notificationService.warning('Inicia sesión para denunciar', 'Comentarios');
      return;
    }
    const motivo = this.pedirMotivoDenuncia();
    if (!motivo) return;

    this.postService.denunciarComentario(c.id, motivo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.notificationService.success('Denuncia enviada. Gracias por reportar.', 'Denuncia'),
      error: () => {},
    });
  }

  /** Pide un motivo de denuncia mostrando opciones predefinidas; permite número o texto libre. */
  private pedirMotivoDenuncia(): string | null {
    const msg = 'Motivo de la denuncia:\n' +
      MOTIVOS_DENUNCIA.map((r, i) => `${i + 1}. ${r}`).join('\n') +
      '\n\nEscribe el número de una opción (o tu propio motivo):';
    const input = (window.prompt(msg) || '').trim();
    if (!input) return null;
    const n = parseInt(input, 10);
    if (n >= 1 && n <= MOTIVOS_DENUNCIA.length) return MOTIVOS_DENUNCIA[n - 1];
    return input;
  }

  /** Escapa HTML y convierte URLs y @menciones en enlaces. */
  formatear(texto: string): string {
    if (!texto) return '';
    const escapado = texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escapado
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="nofollow noopener">$1</a>')
      .replace(/(^|\s)@([a-zA-Z0-9_]+)/g, '$1<a href="/perfil/$2">@$2</a>')
      .replace(/\n/g, '<br>');
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

    this.postService.addComentario(comentario).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        comentario.id = response;
        comentario.usuario = this.currentUser.usuario.userName;
        comentario.avatar = this.currentUser.usuario.avatar;

        if (!respuesta.respuestas) {
          respuesta.respuestas = [];
        }

        respuesta.respuestas.push(comentario);
        respuesta.responder = false;
        respuesta.respuesta = '';
      }
    });
  }

  eliminarComentario(comentarioId: any, i: number): void {
    if (!this.notificationService.confirm('¿Estás seguro de eliminar este comentario? Recuerda que no se podrá recuperar')) {
      return;
    }

    this.postService
      .deleteComentario(comentarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          this.notificationService.success('El comentario ha sido eliminado correctamente', 'Eliminado');
          this.comentarios.splice(i, 1);
        }
      });
  }

  eliminarRespuesta(respuestaId: any, comentario: number, i: number): void {
    if (!this.notificationService.confirm('¿Estás seguro de eliminar esta respuesta? Recuerda que no se podrá recuperar')) {
      return;
    }

    this.postService
      .deleteComentario(respuestaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          this.notificationService.success('La respuesta ha sido eliminada correctamente', 'Eliminado');

          const comment = this.comentarios[comentario];

          if (comment && comment?.respuestas) {
            this.comentarios[comentario].respuestas.splice(i, 1);
          }
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

    ref.afterDismissed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
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
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  voteComentario(comentario: any, cantidad: number): void {
    if (!this.currentUser?.usuario) {
      return;
    }

    this.postService.votarComentario(comentario.id, cantidad).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        if (response !== undefined && response !== null) {
          comentario.votos = response.total ?? comentario.votos ?? 0;
          comentario.miVoto = response.miVoto ?? 0;
        }
      },
      error: () => {}
    });
  }
}

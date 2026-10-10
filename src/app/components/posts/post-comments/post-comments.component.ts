import { Subscription } from 'rxjs';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { DialogDisplayHistoryCommentsComponent } from 'src/app/components/dialogs/dialog-display-history-comments/dialog-display-history-comments.component';
import { ComentarioViewModel, PostDetalle } from 'src/app/models/posts/post-vm.model';
import { ComentarioHilo, ComentariosAcciones } from 'src/app/models/shared/comentario-hilo.model';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { ComentariosComponent } from '../../shared/comentarios/comentarios.component';
import { IHttpComentariosPostService } from '../../../services/interfaces/httpComentariosPost.interface';

/** Convierte un comentario de post (y sus respuestas anidadas) al formato plano de <app-comentarios>. */
function aHilo(c: ComentarioViewModel, parentId: number | null): ComentarioHilo[] {
  const historial = c.historial ?? [];
  const propio: ComentarioHilo = {
    id: c.id,
    parentId,
    contenido: c.contenido,
    fecha: c.fechaComentario,
    // Los posts no guardan la fecha de edición: que haya versiones anteriores ya indica que se editó.
    fechaEdicion: historial[0]?.fecha ?? null,
    userName: c.usuario,
    avatar: c.avatar,
    rango: c.rango ? { nombre: c.rango.nombre, color: c.rango.color, icono: c.rango.icono } : null,
    votos: c.votos ?? 0,
    miVoto: c.miVoto ?? 0,
    votosArriba: c.votosArriba ?? 0,
    votosAbajo: c.votosAbajo ?? 0,
    fijado: !!c.fijado,
    denunciasPendientes: c.denunciasPendientes ?? 0,
    historial: [...historial],
  };

  return [propio, ...(c.respuestas ?? []).flatMap((r) => aHilo(r, c.id))];
}

/** Comentarios de un post: carga los datos del API de posts y los muestra con <app-comentarios>. */
@Component({
    selector: 'app-post-comments',
    templateUrl: './post-comments.component.html',
    imports: [ComentariosComponent],
})
export class PostCommentsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private cargaCargar?: Subscription;
  private comentariosPostService = inject(IHttpComentariosPostService);
  private readonly securityService = inject(IHttpSecurityService);
  private readonly dialog = inject(MatDialog);

  private _post: PostDetalle | null = null;

  public comentarios: ComentarioHilo[] = [];

  @Input() set post(value: PostDetalle | null) {
    const cambio = value?.id !== this._post?.id;
    this._post = value;
    if (cambio) {
      this.cargar();
    }
  }

  get post(): PostDetalle | null {
    return this._post;
  }

  public readonly acciones: ComentariosAcciones = {
    comentar: (contenido, parentId) =>
      this.comentariosPostService.addComentario({ postId: this._post?.id, contenido, comentarioId: parentId ?? undefined }),
    editar: (id, contenido) => this.comentariosPostService.updateComentario({ id, contenido }),
    eliminar: (id) => this.comentariosPostService.deleteComentario(id),
    votar: (id, valor) => this.comentariosPostService.votarComentario(id, valor),
    fijar: (id) => this.comentariosPostService.fijarComentario(id),
    denunciar: (id, motivo) => this.comentariosPostService.denunciarComentario(id, motivo),
  };

  /** Fija comentarios el autor del post o el staff. */
  get puedeFijar(): boolean {
    const usuario = this.securityService.getCurrentUser()?.usuario;
    if (!usuario) return false;
    return usuario.rango === 'Administrador' || usuario.rango === 'Moderador' || usuario.userName === this._post?.usuario?.userName;
  }

  private cargar(): void {
    if (!this._post?.id) {
      this.comentarios = [];
      return;
    }

    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaCargar?.unsubscribe();

    this.cargaCargar = this.comentariosPostService
      .getComentariosByPostId(this._post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lista) => (this.comentarios = (lista ?? []).flatMap((c) => aHilo(c, null))));
  }

  verHistorial(c: ComentarioHilo): void {
    if (!c.historial?.length) return;

    this.dialog.open(DialogDisplayHistoryCommentsComponent, {
      width: '700px',
      data: c.historial,
    });
  }
}

import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { ComentarioViewModel, ComentarioVotoResponse } from 'src/app/models/posts/post-vm.model';

/** Comentarios de posts: listados, alta/edición, borrado/recuperación, votos, fijar y denunciar. */
@Injectable()
export abstract class IHttpComentariosPostService {
  abstract getComentarios(filtro?: AdminFiltro): Observable<PaginatedData<ComentarioViewModel>>;
  abstract getComentariosByUserId(userId: number): Observable<PaginatedData<ComentarioViewModel>>;
  abstract getUltimosComentarios(): Observable<ComentarioViewModel[]>;
  abstract addComentario(comentario: Partial<ComentarioViewModel>): Observable<number>;
  abstract updateComentario(comentario: Partial<ComentarioViewModel>): Observable<ComentarioViewModel>;
  abstract getComentariosByPostId(postId: number): Observable<ComentarioViewModel[]>;
  abstract recuperarComentario(comentarioId: number): Observable<boolean>;
  abstract deleteComentario(comentarioId: number): Observable<boolean>;
  abstract votarComentario(comentarioId: number, cantidad: number): Observable<ComentarioVotoResponse>;
  abstract fijarComentario(comentarioId: number): Observable<boolean>;
  abstract denunciarComentario(comentarioId: number, motivo: string): Observable<boolean>;
}

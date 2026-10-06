import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { ShoutAdmin, ShoutComentarioViewModel, ShoutComentarioVoto, ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';

@Injectable()
export abstract class IHttpPerfilService {
  abstract getShouts(userId: number): Observable<PaginatedData<ShoutViewModel, 'shouts'>>;
  abstract getTopShouts(count?: number): Observable<any[]>;
  abstract getShoutsAdmin(): Observable<PaginatedData<ShoutAdmin, 'shouts'>>;
  abstract createShout(shout: Partial<ShoutViewModel>): Observable<ShoutViewModel>;
  abstract deleteShout(shoutId: number): Observable<boolean>;
  abstract recoveryShout(shoutId: number): Observable<boolean>;
  abstract getShoutById(shoutId: number): Observable<ShoutViewModel>;
  abstract getComentariosByShoutId(shoutId: number): Observable<ShoutComentarioViewModel[]>;
  abstract addShoutComentario(model: { shoutId: number; comentario: string; parentId?: number }): Observable<number>;
  abstract deleteShoutComentario(id: number): Observable<boolean>;
  abstract votarShoutComentario(comentarioId: number, valor: number): Observable<ShoutComentarioVoto>;
  abstract editarShoutComentario(comentarioId: number, contenido: string): Observable<boolean>;
  abstract fijarShoutComentario(comentarioId: number): Observable<boolean>;
  abstract denunciarShoutComentario(comentarioId: number, motivo: string): Observable<boolean>;
  abstract getDenunciasShoutComentarios(page: number, pageCount: number, soloPendientes?: boolean): Observable<any>;
  abstract resolverDenunciaShoutComentario(denunciaId: number): Observable<any>;
  abstract eliminarDenunciaShoutComentario(denunciaId: number): Observable<any>;
}

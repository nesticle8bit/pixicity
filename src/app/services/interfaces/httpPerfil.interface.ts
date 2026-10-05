import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { ShoutComentarioViewModel, ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';

@Injectable()
export abstract class IHttpPerfilService {
  abstract getShouts(userId: number): Observable<PaginatedData<ShoutViewModel, 'shouts'>>;
  abstract getTopShouts(count?: number): Observable<any[]>;
  abstract getShoutsAdmin(): Observable<PaginatedData<ShoutViewModel, 'shouts'>>;
  abstract createShout(shout: Partial<ShoutViewModel>): Observable<ShoutViewModel>;
  abstract deleteShout(shoutId: number): Observable<boolean>;
  abstract recoveryShout(shoutId: number): Observable<boolean>;
  abstract getShoutById(shoutId: number): Observable<ShoutViewModel>;
  abstract getComentariosByShoutId(shoutId: number): Observable<ShoutComentarioViewModel[]>;
  abstract addShoutComentario(model: { shoutId: number; comentario: string }): Observable<number>;
  abstract deleteShoutComentario(id: number): Observable<boolean>;
  abstract votarShoutComentario(comentarioId: number, valor: number): Observable<any>;
  abstract editarShoutComentario(comentarioId: number, contenido: string): Observable<any>;
  abstract fijarShoutComentario(comentarioId: number): Observable<any>;
  abstract denunciarShoutComentario(comentarioId: number, motivo: string): Observable<any>;
  abstract getDenunciasShoutComentarios(page: number, pageCount: number, soloPendientes?: boolean): Observable<any>;
  abstract resolverDenunciaShoutComentario(denunciaId: number): Observable<any>;
  abstract eliminarDenunciaShoutComentario(denunciaId: number): Observable<any>;
}

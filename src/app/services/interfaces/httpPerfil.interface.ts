import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpPerfilService {
  abstract getShouts(userId: number): Observable<any>;
  abstract getTopShouts(count?: number): Observable<any>;
  abstract getShoutsAdmin(): Observable<any>;
  abstract createShout(shout: any): Observable<any>;
  abstract deleteShout(shoutId: number): Observable<any>;
  abstract recoveryShout(shoutId: number): Observable<any>;
  abstract getShoutById(shoutId: number): Observable<any>;
  abstract getComentariosByShoutId(shoutId: number): Observable<any>;
  abstract addShoutComentario(model: any): Observable<any>;
  abstract deleteShoutComentario(id: number): Observable<any>;
  abstract votarShoutComentario(comentarioId: number, valor: number): Observable<any>;
  abstract editarShoutComentario(comentarioId: number, contenido: string): Observable<any>;
  abstract fijarShoutComentario(comentarioId: number): Observable<any>;
  abstract denunciarShoutComentario(comentarioId: number, motivo: string): Observable<any>;
  abstract getDenunciasShoutComentarios(page: number, pageCount: number, soloPendientes?: boolean): Observable<any>;
  abstract resolverDenunciaShoutComentario(denunciaId: number): Observable<any>;
  abstract eliminarDenunciaShoutComentario(denunciaId: number): Observable<any>;
}

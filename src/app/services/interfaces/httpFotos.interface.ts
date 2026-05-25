import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpFotosService {
  abstract getFotos(search: any): Observable<any>;
  abstract getFotosByUsuario(userName: string, search: any): Observable<any>;
  abstract getFotoById(fotoId: number): Observable<any>;
  abstract saveFoto(foto: any): Observable<any>;
  abstract updateFoto(foto: any): Observable<any>;
  abstract deleteFoto(fotoId: number): Observable<any>;
  abstract votarFoto(fotoId: number, cantidad: number): Observable<any>;
  abstract incrementVisitas(fotoId: number): Observable<any>;
  abstract uploadImage(file: File): Observable<any>;

  // Comentarios
  abstract getComentariosByFotoId(fotoId: number): Observable<any>;
  abstract addComentario(comentario: any): Observable<any>;
  abstract deleteComentario(id: number): Observable<any>;
  abstract votarComentario(comentarioId: number, cantidad: number): Observable<any>;
}

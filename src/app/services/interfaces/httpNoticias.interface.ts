import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpNoticiasService {
  abstract getNoticias(search: string): Observable<any>;
  abstract saveNoticias(noticia: any): Observable<any>;
  abstract updateNoticias(noticia: any): Observable<any>;
  abstract deleteNoticias(id: number): Observable<any>;
  abstract getAllNoticias(): Observable<any>;
}

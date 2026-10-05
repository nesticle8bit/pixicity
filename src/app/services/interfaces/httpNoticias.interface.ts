import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { NoticiaModel } from 'src/app/models/web/noticia.model';

@Injectable()
export abstract class IHttpNoticiasService {
  abstract getNoticias(search: string): Observable<PaginatedData<NoticiaModel, 'noticias'>>;
  abstract saveNoticias(noticia: Partial<NoticiaModel>): Observable<number>;
  abstract updateNoticias(noticia: Partial<NoticiaModel>): Observable<boolean>;
  abstract deleteNoticias(id: number): Observable<boolean>;
  abstract getAllNoticias(): Observable<NoticiaModel[]>;
}

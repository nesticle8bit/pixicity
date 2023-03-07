import { TopUserModel } from 'src/app/models/web/topUser.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TopPostModel } from 'src/app/models/web/topPost.model';

@Injectable()
export abstract class IHttpWebService {
  abstract getTopUsers(): Observable<TopUserModel[]>;
  abstract getTopPosts(date: string): Observable<TopPostModel[]>;
  abstract getAdsByType(type: string): Observable<string>;
  abstract getAfiliados(): Observable<any>;
  abstract changeAfiliadoActive(obj: any): Observable<any>;
  abstract hitAfiliado(codigo: string): Observable<any>;
  abstract getHistorialModeracion(): Observable<any>;
  abstract getPaginas(search: any): Observable<any>;
  abstract getAllPaginas(): Observable<any>;
  abstract savePagina(pagina: any): Observable<any>;
  abstract deletePagina(paginaId: number): Observable<any>;
  abstract getPaginaBySlug(slug: string): Observable<any>;
}

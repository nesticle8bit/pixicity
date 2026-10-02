import { PaginaViewModel } from 'src/app/models/shared/service-types.model';
import { TopUserModel } from 'src/app/models/web/topUser.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TopPostModel } from 'src/app/models/web/topPost.model';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';

@Injectable()
export abstract class IHttpWebService {
  abstract getTopUsers(): Observable<TopUserModel[]>;
  abstract getTopPosts(date: string): Observable<TopPostModel[]>;
  abstract getAdsByType(type: string): Observable<string>;
  abstract getAfiliados(): Observable<AfiliacionModel[]>;
  abstract changeAfiliadoActive(obj: { id: number; activo: boolean }): Observable<boolean>;
  abstract hitAfiliado(codigo: string): Observable<boolean>;
  abstract getHistorialModeracion(): Observable<unknown>;
  abstract getPaginas(search: string): Observable<PaginatedData<PaginaViewModel>>;
  abstract getAllPaginas(): Observable<PaginaViewModel[]>;
  abstract savePagina(pagina: Partial<PaginaViewModel>): Observable<number>;
  abstract deletePagina(paginaId: number): Observable<boolean>;
  abstract getPaginaBySlug(slug: string): Observable<PaginaViewModel>;
  abstract getConfiguracionFooter(): Observable<unknown>;
}

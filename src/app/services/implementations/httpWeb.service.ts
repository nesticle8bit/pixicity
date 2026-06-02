import { IHttpWebService } from '../interfaces/httpWeb.interface';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../shared/notification.service';
import { TopUserModel } from 'src/app/models/web/topUser.model';
import { TopPostModel } from 'src/app/models/web/topPost.model';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';

interface PaginaViewModel {
  id: number;
  titulo: string;
  slug: string;
  contenido: string;
  eliminado: boolean;
}

@Injectable()
export class HttpWebService implements IHttpWebService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
    private router: Router,
  ) {}

  getTopUsers(): Observable<TopUserModel[]> {
    return this.http
      .get<ApiResponse<TopUserModel[]>>(`${environment.api}/api/tops/getTopUsers`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getTopPosts(date: string): Observable<TopPostModel[]> {
    return this.http
      .get<ApiResponse<TopPostModel[]>>(`${environment.api}/api/tops/getTopPosts?date=${date}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getAdsByType(type: string): Observable<string> {
    return this.http
      .get<ApiResponse<string>>(`${environment.api}/api/web/getAdsByType?type=${type}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getAfiliados(): Observable<AfiliacionModel[]> {
    return this.http
      .get<ApiResponse<AfiliacionModel[]>>(`${environment.api}/api/web/getAfiliados`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  changeAfiliadoActive(obj: { id: number; activo: boolean }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/web/changeAfiliadoActive`, obj)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  hitAfiliado(codigo: string): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(`${environment.api}/api/web/hitAfiliado?codigo=${codigo}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getHistorialModeracion(): Observable<unknown> {
    return this.http
      .get<ApiResponse<unknown>>(`${environment.api}/api/web/getHistorialModeracion`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPaginas(search: string): Observable<PaginatedData<PaginaViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<PaginaViewModel>>>(
        `${environment.api}/api/paginas/getPaginas?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&searchValue=${search}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getAllPaginas(): Observable<PaginaViewModel[]> {
    return this.http
      .get<ApiResponse<PaginaViewModel[]>>(`${environment.api}/api/paginas/getAllPaginas`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  savePagina(pagina: Partial<PaginaViewModel>): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/paginas/savePagina`, pagina)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deletePagina(paginaId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/paginas/deletePagina`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: paginaId },
      })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPaginaBySlug(slug: string): Observable<PaginaViewModel> {
    return this.http
      .get<ApiResponse<PaginaViewModel>>(`${environment.api}/api/paginas/getPaginaBySlug?slug=${slug}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getConfiguracionFooter(): Observable<unknown> {
    return this.http
      .get<ApiResponse<unknown>>(`${environment.api}/api/configuracion/getFooter`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}

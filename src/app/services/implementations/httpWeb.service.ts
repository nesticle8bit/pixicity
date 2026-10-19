import { PaginaAdmin } from 'src/app/models/admin/filas-admin.model';
import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { HistorialViewModel } from 'src/app/models/web/historial.model';
import { PaginaViewModel } from 'src/app/models/shared/service-types.model';
import { IHttpWebService } from '../interfaces/httpWeb.interface';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../shared/notification.service';
import { TopUserModel } from 'src/app/models/web/topUser.model';
import { TopPostModel } from 'src/app/models/web/topPost.model';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';


@Injectable()
export class HttpWebService implements IHttpWebService {
  private notificationService = inject(NotificationService);
  private paginationService = inject(PaginationService);
  private helper = inject(HelperService);
  private http = inject(HttpClient);
  private router = inject(Router);


  getTopUsers(): Observable<TopUserModel[]> {
    return this.http
      .get<ApiResponse<TopUserModel[]>>(`${environment.api}/api/tops/usuarios`)
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
      .get<ApiResponse<TopPostModel[]>>(`${environment.api}/api/tops/posts?date=${date}`)
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

  getPublicidad(tamano: string): Observable<string> {
    return this.http
      .get<ApiResponse<string>>(`${environment.api}/api/publicidad/${encodeURIComponent(tamano)}`)
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
      .get<ApiResponse<AfiliacionModel[]>>(`${environment.api}/api/afiliados/activos`)
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
      .put<ApiResponse<boolean>>(`${environment.api}/api/afiliados/${obj.id}/activo`, obj)
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

  hitAfiliado(codigo: string): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${environment.api}/api/afiliados/${encodeURIComponent(codigo)}/salidas`, {})
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

  getHistorialModeracion(): Observable<HistorialViewModel[]> {
    return this.http
      .get<ApiResponse<HistorialViewModel[]>>(`${environment.api}/api/moderacion/historial`)
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

  getPaginas(search: string, filtro: AdminFiltro = {}): Observable<PaginatedData<PaginaAdmin, 'paginas'>> {
    return this.http
      .get<ApiResponse<PaginatedData<PaginaAdmin, 'paginas'>>>(
        `${environment.api}/api/paginas/admin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&searchValue=${search}`, { params: adminParams(filtro) },
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
      .get<ApiResponse<PaginaViewModel[]>>(`${environment.api}/api/paginas`)
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
      .post<ApiResponse<number>>(`${environment.api}/api/paginas`, pagina)
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
      .delete<ApiResponse<boolean>>(`${environment.api}/api/paginas/${paginaId}`)
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
      .get<ApiResponse<PaginaViewModel>>(`${environment.api}/api/paginas/por-slug/${encodeURIComponent(slug)}`)
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

  getConfiguracionFooter(): Observable<string> {
    return this.http
      .get<ApiResponse<string>>(`${environment.api}/api/configuracion/footer`)
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

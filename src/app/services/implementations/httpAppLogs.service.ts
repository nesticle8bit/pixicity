import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { AppLog, AppLogFiltro, AppLogResumen } from 'src/app/models/logs/app-log.model';
import { environment } from 'src/environments/environment';
import { IHttpAppLogsService } from '../interfaces/httpAppLogs.interface';
import { HelperService } from '../shared/helper.service';
import { NotificationService } from '../shared/notification.service';

@Injectable()
export class HttpAppLogsService implements IHttpAppLogsService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  private notificationService = inject(NotificationService);

  private readonly base = `${environment.api}/api/appLogs`;

  private unwrap<T>() {
    return map((response: ApiResponse<T>) => {
      if (response.status === 200) {
        return response.data;
      }
      this.notificationService.error(response.errors.join(', '), 'Error');
      throw new Error(response.errors?.join(', ') ?? 'Error');
    });
  }

  private filtroParams(filtro: AppLogFiltro, params = new HttpParams()): HttpParams {
    params = params.set('soloPendientes', filtro.soloPendientes);
    if (filtro.nivel) params = params.set('nivel', filtro.nivel);
    if (filtro.origen) params = params.set('origen', filtro.origen);
    if (filtro.texto?.trim()) params = params.set('texto', filtro.texto.trim());
    return params;
  }

  getLogs(page: number, pageCount: number, filtro: AppLogFiltro): Observable<PaginatedData<AppLog>> {
    const params = this.filtroParams(filtro, new HttpParams().set('page', page).set('pageCount', pageCount));
    return this.http
      .get<ApiResponse<PaginatedData<AppLog>>>(`${this.base}/getLogs`, { params })
      .pipe(this.unwrap<PaginatedData<AppLog>>(), catchError(this.helper.errorHandler));
  }

  getLog(id: number): Observable<AppLog> {
    return this.http
      .get<ApiResponse<AppLog>>(`${this.base}/getLog`, { params: { id } })
      .pipe(this.unwrap<AppLog>(), catchError(this.helper.errorHandler));
  }

  getResumen(): Observable<AppLogResumen> {
    return this.http
      .get<ApiResponse<AppLogResumen>>(`${this.base}/getResumen`)
      .pipe(this.unwrap<AppLogResumen>(), catchError(this.helper.errorHandler));
  }

  resolver(id: number, todosLosIguales: boolean): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${this.base}/resolver`, null, { params: { id, todosLosIguales } })
      .pipe(this.unwrap<number>(), catchError(this.helper.errorHandler));
  }

  resolverTodos(filtro: AppLogFiltro): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${this.base}/resolverTodos`, {
        nivel: filtro.nivel || null,
        origen: filtro.origen || null,
        texto: filtro.texto?.trim() || null,
      })
      .pipe(this.unwrap<number>(), catchError(this.helper.errorHandler));
  }
}

import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { NotificationService } from '../shared/notification.service';
import { IHttpLogsService } from '../interfaces/httpLogs.interface';
import { PaginationService } from '../shared/pagination.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { FiltroNotificaciones, MonitorViewModel, StatsViewModel } from 'src/app/models/logs/logs-vm.model';

@Injectable()
export class HttpLogsService implements IHttpLogsService {
  private notificationService = inject(NotificationService);
  private paginationService = inject(PaginationService);
  private helper = inject(HelperService);
  private http = inject(HttpClient);


  getNotificaciones(filtro: FiltroNotificaciones = {}): Observable<PaginatedData<MonitorViewModel>> {
    let params = new HttpParams()
      .set('page', this.paginationService.page)
      .set('pageCount', this.paginationService.pageCount);
    if (filtro.tipos?.length) params = params.set('tipos', filtro.tipos.join(','));
    if (filtro.q?.trim()) params = params.set('q', filtro.q.trim());
    if (filtro.soloNoLeidas) params = params.set('soloNoLeidas', true);
    if (filtro.periodo) params = params.set('periodo', filtro.periodo);

    return this.http
      .get<ApiResponse<PaginatedData<MonitorViewModel>>>(`${environment.api}/api/notificaciones`, { params })
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

  getLastNotificaciones(): Observable<MonitorViewModel[]> {
    return this.http
      .get<ApiResponse<MonitorViewModel[]>>(`${environment.api}/api/notificaciones/recientes`)
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

  setNotificacionesAsReaded(): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/notificaciones/leidas`, {})
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

  getStats(): Observable<StatsViewModel> {
    return this.http
      .get<ApiResponse<StatsViewModel>>(`${environment.api}/api/notificaciones/estadisticas`)
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

  getMonitorsAdmin(filtro: AdminFiltro = {}): Observable<PaginatedData<MonitorViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<MonitorViewModel>>>(
        `${environment.api}/api/notificaciones/admin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
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

  deleteNotificacion(id: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/notificaciones/${id}`)
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

  getPreferencias(): Observable<{ tipo: string; activa: boolean }[]> {
    return this.http
      .get<ApiResponse<{ tipo: string; activa: boolean }[]>>(`${environment.api}/api/notificaciones/preferencias`)
      .pipe(map((r) => r.data ?? []));
  }

  setPreferencia(tipo: string, activa: boolean): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/notificaciones/preferencias/${encodeURIComponent(tipo)}?activa=${activa}`, {})
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') || 'No se pudo guardar'); }));
  }
}
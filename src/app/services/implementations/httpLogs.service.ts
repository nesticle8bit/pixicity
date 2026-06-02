import { NotificationService } from '../shared/notification.service';
import { IHttpLogsService } from '../interfaces/httpLogs.interface';
import { PaginationService } from '../shared/pagination.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { MonitorViewModel, StatsViewModel } from 'src/app/models/logs/logs-vm.model';

@Injectable()
export class HttpLogsService implements IHttpLogsService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getNotificaciones(search: string): Observable<PaginatedData<MonitorViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<MonitorViewModel>>>(
        `${environment.api}/api/monitors/getNotificaciones?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${search}`,
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

  getLastNotificaciones(): Observable<MonitorViewModel[]> {
    return this.http
      .get<ApiResponse<MonitorViewModel[]>>(`${environment.api}/api/monitors/getLastNotificaciones`)
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
      .get<ApiResponse<boolean>>(`${environment.api}/api/monitors/setNotificacionesAsReaded`)
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
      .get<ApiResponse<StatsViewModel>>(`${environment.api}/api/monitors/getStats`)
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

  getMonitorsAdmin(search: string): Observable<PaginatedData<MonitorViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<MonitorViewModel>>>(
        `${environment.api}/api/monitors/getMonitorAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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
      .delete<ApiResponse<boolean>>(`${environment.api}/api/monitors/deleteNotificacion`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id },
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
}

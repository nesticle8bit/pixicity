import { IHttpModeracionService } from '../interfaces/httpModeracion.interface';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse } from 'src/app/models/api/api-response.model';

@Injectable()
export class HttpModeracionService implements IHttpModeracionService {
  constructor(
    private notificationService: NotificationService,
    private helper: HelperService,
    private http: HttpClient
  ) {}

  private unwrap<T>() {
    return map((response: ApiResponse<T>) => {
      if (response.status === 200) {
        return response.data!;
      }
      this.notificationService.error(response.errors.join(', '), 'Error');
      throw new Error(response.errors?.join(', ') ?? 'Error');
    });
  }

  getReportes(
    page: number,
    pageCount: number,
    tipoContenido: number | null,
    soloPendientes: boolean
  ): Observable<any> {
    let url = `${environment.api}/api/moderacion/getReportes?page=${page}&pageCount=${pageCount}&soloPendientes=${soloPendientes}`;
    if (tipoContenido != null) {
      url += `&tipoContenido=${tipoContenido}`;
    }
    return this.http
      .get<ApiResponse<any>>(url)
      .pipe(this.unwrap<any>())
      .pipe(catchError(this.helper.errorHandler));
  }

  resolverReporte(reporteId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/moderacion/resolverReporte?reporteId=${reporteId}`, {})
      .pipe(this.unwrap<boolean>())
      .pipe(catchError(this.helper.errorHandler));
  }

  descartarReporte(reporteId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/moderacion/descartarReporte?reporteId=${reporteId}`)
      .pipe(this.unwrap<boolean>())
      .pipe(catchError(this.helper.errorHandler));
  }

  eliminarContenidoReportado(reporteId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/moderacion/eliminarContenidoReportado?reporteId=${reporteId}`, {})
      .pipe(this.unwrap<boolean>())
      .pipe(catchError(this.helper.errorHandler));
  }

  getModeracionLogs(page: number, pageCount: number): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${environment.api}/api/moderacion/getModeracionLogs?page=${page}&pageCount=${pageCount}`)
      .pipe(this.unwrap<any>())
      .pipe(catchError(this.helper.errorHandler));
  }
}

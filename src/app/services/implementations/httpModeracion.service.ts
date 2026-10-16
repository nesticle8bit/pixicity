import { IHttpModeracionService } from '../interfaces/httpModeracion.interface';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { ModeracionLog, PaginaReportes, ReglaProtocolo, ReportesComunidad } from 'src/app/models/admin/moderacion.model';

@Injectable()
export class HttpModeracionService implements IHttpModeracionService {
  private notificationService = inject(NotificationService);
  private helper = inject(HelperService);
  private http = inject(HttpClient);


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
  ): Observable<PaginaReportes> {
    let url = `${environment.api}/api/moderacion/getReportes?page=${page}&pageCount=${pageCount}&soloPendientes=${soloPendientes}`;
    if (tipoContenido != null) {
      url += `&tipoContenido=${tipoContenido}`;
    }
    return this.http
      .get<ApiResponse<PaginaReportes>>(url)
      .pipe(this.unwrap<PaginaReportes>())
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

  eliminarContenidoReportado(reporteId: number, regla: string | null = null): Observable<boolean> {
    const extra = regla ? `&regla=${encodeURIComponent(regla)}` : '';
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/moderacion/eliminarContenidoReportado?reporteId=${reporteId}${extra}`, {})
      .pipe(this.unwrap<boolean>())
      .pipe(catchError(this.helper.errorHandler));
  }

  getReportesComunidad(comunidadId: number, soloPendientes: boolean): Observable<ReportesComunidad> {
    return this.http
      .get<ApiResponse<ReportesComunidad>>(
        `${environment.api}/api/moderacion/getReportesComunidad?comunidadId=${comunidadId}&soloPendientes=${soloPendientes}`,
      )
      .pipe(this.unwrap<ReportesComunidad>())
      .pipe(catchError(this.helper.errorHandler));
  }

  getReglasProtocolo(): Observable<ReglaProtocolo[]> {
    return this.http
      .get<ApiResponse<ReglaProtocolo[]>>(`${environment.api}/api/moderacion/getReglasProtocolo`)
      .pipe(this.unwrap<ReglaProtocolo[]>())
      .pipe(catchError(() => of([] as ReglaProtocolo[])));
  }

  getModeracionLogs(page: number, pageCount: number): Observable<PaginatedData<ModeracionLog>> {
    return this.http
      .get<ApiResponse<PaginatedData<ModeracionLog>>>(`${environment.api}/api/moderacion/getModeracionLogs?page=${page}&pageCount=${pageCount}`)
      .pipe(this.unwrap<PaginatedData<ModeracionLog>>())
      .pipe(catchError(this.helper.errorHandler));
  }
}

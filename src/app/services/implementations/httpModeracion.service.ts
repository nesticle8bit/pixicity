import { IHttpModeracionService } from '../interfaces/httpModeracion.interface';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { AccionLote, AccionModeracion, FiltroHistorial, MiModeracion, ModeracionLog, PaginaApelaciones, PaginaReportes, ReglaProtocolo, ReportesComunidad } from 'src/app/models/admin/moderacion.model';

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
    let url = `${environment.api}/api/moderacion/reportes?page=${page}&pageCount=${pageCount}&soloPendientes=${soloPendientes}`;
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
      .put<ApiResponse<boolean>>(`${environment.api}/api/moderacion/reportes/${reporteId}/resuelto`, {})
      .pipe(this.unwrap<boolean>())
      .pipe(catchError(this.helper.errorHandler));
  }

  descartarReporte(reporteId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/moderacion/reportes/${reporteId}`)
      .pipe(this.unwrap<boolean>())
      .pipe(catchError(this.helper.errorHandler));
  }

  atenderLote(ids: number[], accion: AccionLote): Observable<number> {
    return this.http
      .put<ApiResponse<number>>(`${environment.api}/api/moderacion/reportes/lote`, { ids, accion })
      .pipe(this.unwrap<number>())
      .pipe(catchError(this.helper.errorHandler));
  }

  eliminarContenidoReportado(reporteId: number, regla: string | null = null): Observable<boolean> {
    const extra = regla ? `?regla=${encodeURIComponent(regla)}` : '';
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/moderacion/reportes/${reporteId}/contenido${extra}`)
      .pipe(this.unwrap<boolean>())
      .pipe(catchError(this.helper.errorHandler));
  }

  getReportesComunidad(comunidadId: number, soloPendientes: boolean): Observable<ReportesComunidad> {
    return this.http
      .get<ApiResponse<ReportesComunidad>>(
        `${environment.api}/api/moderacion/comunidades/${comunidadId}/reportes?soloPendientes=${soloPendientes}`,
      )
      .pipe(this.unwrap<ReportesComunidad>())
      .pipe(catchError(this.helper.errorHandler));
  }

  getReglasProtocolo(): Observable<ReglaProtocolo[]> {
    return this.http
      .get<ApiResponse<ReglaProtocolo[]>>(`${environment.api}/api/moderacion/reglas`)
      .pipe(this.unwrap<ReglaProtocolo[]>())
      .pipe(catchError(() => of([] as ReglaProtocolo[])));
  }

  getModeracionLogs(page: number, pageCount: number): Observable<PaginatedData<ModeracionLog>> {
    return this.http
      .get<ApiResponse<PaginatedData<ModeracionLog>>>(`${environment.api}/api/moderacion/logs?page=${page}&pageCount=${pageCount}`)
      .pipe(this.unwrap<PaginatedData<ModeracionLog>>())
      .pipe(catchError(this.helper.errorHandler));
  }

  getHistorial(page: number, pageCount: number, filtro: FiltroHistorial = {}): Observable<PaginatedData<ModeracionLog>> {
    const params: Record<string, string | number> = { page, pageCount };
    if (filtro.accion) params['accion'] = filtro.accion;
    if (filtro.moderador?.trim()) params['moderador'] = filtro.moderador.trim();
    return this.http
      .get<ApiResponse<PaginatedData<ModeracionLog>>>(`${environment.api}/api/moderacion/historial`, { params })
      .pipe(this.unwrap<PaginatedData<ModeracionLog>>())
      .pipe(catchError(this.helper.errorHandler));
  }

  getMisModeraciones(): Observable<MiModeracion[]> {
    return this.http
      .get<ApiResponse<MiModeracion[]>>(`${environment.api}/api/apelaciones/me`)
      .pipe(this.unwrap<MiModeracion[]>())
      .pipe(catchError(this.helper.errorHandler));
  }

  apelar(moderacionLogId: number, mensaje: string): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/apelaciones`, { moderacionLogId, mensaje })
      .pipe(this.unwrap<number>())
      .pipe(catchError(this.helper.errorHandler));
  }

  apelarBaneo(token: string, mensaje: string): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/apelaciones/baneo`, { token, mensaje })
      .pipe(this.unwrap<number>())
      .pipe(catchError(this.helper.errorHandler));
  }

  getApelaciones(page: number, pageCount: number, soloPendientes: boolean): Observable<PaginaApelaciones> {
    return this.http
      .get<ApiResponse<PaginaApelaciones>>(`${environment.api}/api/apelaciones`, { params: { page, pageCount, soloPendientes } })
      .pipe(this.unwrap<PaginaApelaciones>())
      .pipe(catchError(this.helper.errorHandler));
  }

  resolverApelacion(id: number, aceptar: boolean, respuesta: string): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/apelaciones/${id}/resolucion`, { aceptar, respuesta })
      .pipe(this.unwrap<boolean>())
      .pipe(catchError(this.helper.errorHandler));
  }

  /** Solo admins: la cierra sin respuesta ni aviso al usuario. */
  descartarApelacion(id: number): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/apelaciones/${id}/descarte`, {})
      .pipe(this.unwrap<boolean>())
      .pipe(catchError(this.helper.errorHandler));
  }

  getAccionesHistorial(): Observable<AccionModeracion[]> {
    return this.http
      .get<ApiResponse<AccionModeracion[]>>(`${environment.api}/api/moderacion/historial/acciones`)
      .pipe(this.unwrap<AccionModeracion[]>())
      .pipe(catchError(() => of([] as AccionModeracion[])));
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { AccionModeracion, FiltroHistorial, ModeracionLog, PaginaReportes, ReglaProtocolo, ReportesComunidad } from 'src/app/models/admin/moderacion.model';

@Injectable()
export abstract class IHttpModeracionService {
  abstract getReportes(
    page: number,
    pageCount: number,
    tipoContenido: number | null,
    soloPendientes: boolean
  ): Observable<PaginaReportes>;
  abstract resolverReporte(reporteId: number): Observable<boolean>;
  abstract descartarReporte(reporteId: number): Observable<boolean>;
  /** `regla`: id de la regla del protocolo que incumple (se le cita al autor). */
  abstract eliminarContenidoReportado(reporteId: number, regla?: string | null): Observable<boolean>;
  abstract getReglasProtocolo(): Observable<ReglaProtocolo[]>;
  /** Denuncias de comentarios de una comunidad (creador o staff de la comunidad). */
  abstract getReportesComunidad(comunidadId: number, soloPendientes: boolean): Observable<ReportesComunidad>;
  abstract getModeracionLogs(page: number, pageCount: number): Observable<PaginatedData<ModeracionLog>>;
  /** /mod-history: lo mismo que la bitácora, para cualquier usuario con sesión. */
  abstract getHistorial(page: number, pageCount: number, filtro?: FiltroHistorial): Observable<PaginatedData<ModeracionLog>>;
  abstract getAccionesHistorial(): Observable<AccionModeracion[]>;
}

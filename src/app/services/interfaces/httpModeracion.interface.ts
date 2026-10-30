import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { AccionLote, AccionModeracion, FiltroHistorial, MiModeracion, ModeracionLog, PaginaApelaciones, PaginaReportes, ReglaProtocolo, ReportesComunidad } from 'src/app/models/admin/moderacion.model';

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
  /** Varios a la vez; devuelve cuántos se atendieron ("resolver" no reabre los ya resueltos). */
  abstract atenderLote(ids: number[], accion: AccionLote): Observable<number>;
  /** `regla`: id de la regla del protocolo que incumple (se le cita al autor). */
  abstract eliminarContenidoReportado(reporteId: number, regla?: string | null): Observable<boolean>;
  abstract getReglasProtocolo(): Observable<ReglaProtocolo[]>;
  /** Denuncias de comentarios de una comunidad (creador o staff de la comunidad). */
  abstract getReportesComunidad(comunidadId: number, soloPendientes: boolean): Observable<ReportesComunidad>;
  abstract getModeracionLogs(page: number, pageCount: number): Observable<PaginatedData<ModeracionLog>>;
  /** /mod-history: lo mismo que la bitácora, solo para moderadores y administradores. */
  abstract getHistorial(page: number, pageCount: number, filtro?: FiltroHistorial): Observable<PaginatedData<ModeracionLog>>;
  abstract getAccionesHistorial(): Observable<AccionModeracion[]>;
  /** Lo que moderaron del usuario actual, con el estado de su apelación. */
  abstract getMisModeraciones(): Observable<MiModeracion[]>;
  /** Error con el motivo si no se puede (plazo vencido, ya apelada, mensaje corto). */
  abstract apelar(moderacionLogId: number, mensaje: string): Observable<number>;
  /** Sin sesión: con el token que devolvió el login a un usuario baneado. */
  abstract apelarBaneo(token: string, mensaje: string): Observable<number>;
  abstract getApelaciones(page: number, pageCount: number, soloPendientes: boolean): Observable<PaginaApelaciones>;
  abstract resolverApelacion(id: number, aceptar: boolean, respuesta: string): Observable<boolean>;
  abstract descartarApelacion(id: number): Observable<boolean>;
}

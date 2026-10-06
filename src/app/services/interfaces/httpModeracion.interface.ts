import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { ModeracionLog, PaginaReportes } from 'src/app/models/admin/moderacion.model';

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
  abstract eliminarContenidoReportado(reporteId: number): Observable<boolean>;
  abstract getModeracionLogs(page: number, pageCount: number): Observable<PaginatedData<ModeracionLog>>;
}

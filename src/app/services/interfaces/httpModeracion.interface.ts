import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpModeracionService {
  abstract getReportes(
    page: number,
    pageCount: number,
    tipoContenido: number | null,
    soloPendientes: boolean
  ): Observable<any>;
  abstract resolverReporte(reporteId: number): Observable<boolean>;
  abstract descartarReporte(reporteId: number): Observable<boolean>;
  abstract eliminarContenidoReportado(reporteId: number): Observable<boolean>;
  abstract getModeracionLogs(page: number, pageCount: number): Observable<any>;
}

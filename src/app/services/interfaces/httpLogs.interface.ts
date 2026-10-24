import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { MonitorAdmin } from 'src/app/models/admin/filas-admin.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { FiltroNotificaciones, MonitorViewModel, StatsViewModel } from 'src/app/models/logs/logs-vm.model';

@Injectable()
export abstract class IHttpLogsService {
  abstract getNotificaciones(filtro?: FiltroNotificaciones): Observable<PaginatedData<MonitorViewModel>>;
  abstract getLastNotificaciones(): Observable<MonitorViewModel[]>;
  abstract setNotificacionesAsReaded(): Observable<boolean>;
  abstract getStats(): Observable<StatsViewModel>;
  abstract getMonitorsAdmin(filtro?: AdminFiltro): Observable<PaginatedData<MonitorAdmin>>;
  abstract deleteNotificacion(id: number): Observable<boolean>;
  /** Tipos de aviso que el usuario puede apagar y si están activos. */
  abstract getPreferencias(): Observable<{ tipo: string; activa: boolean }[]>;
  abstract setPreferencia(tipo: string, activa: boolean): Observable<boolean>;
}

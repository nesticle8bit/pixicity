import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
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
  abstract getMonitorsAdmin(filtro?: AdminFiltro): Observable<PaginatedData<MonitorViewModel>>;
  abstract deleteNotificacion(id: number): Observable<boolean>;
}

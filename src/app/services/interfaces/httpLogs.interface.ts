import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { MonitorAdmin } from 'src/app/models/admin/filas-admin.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { FiltroNotificaciones, MonitorViewModel, PreferenciasPush, StatsViewModel, SuscripcionPush } from 'src/app/models/logs/logs-vm.model';

@Injectable()
export abstract class IHttpLogsService {
  abstract getNotificaciones(filtro?: FiltroNotificaciones): Observable<PaginatedData<MonitorViewModel>>;
  abstract getLastNotificaciones(): Observable<MonitorViewModel[]>;
  /** Adónde lleva la notificación (lo usa el aviso en vivo al tocarlo). */
  abstract getEnlaceNotificacion(id: number): Observable<string>;
  abstract setNotificacionesVistas(hastaId: number): Observable<boolean>;
  abstract setNotificacionLeida(id: number): Observable<boolean>;
  abstract setNotificacionesAsReaded(hastaId: number): Observable<boolean>;
  abstract getStats(): Observable<StatsViewModel>;
  abstract getMonitorsAdmin(filtro?: AdminFiltro): Observable<PaginatedData<MonitorAdmin>>;
  abstract deleteNotificacion(id: number): Observable<boolean>;
  /** Tipos de aviso que el usuario puede apagar y si están activos. */
  abstract getPreferencias(): Observable<{ tipo: string; activa: boolean }[]>;
  abstract setPreferencia(tipo: string, activa: boolean): Observable<boolean>;
  /** Clave VAPID para suscribir el navegador a las notificaciones de escritorio; null si el servidor no las envía. */
  abstract getClavePush(): Observable<string | null>;
  /** Qué avisa este dispositivo (por el endpoint de su suscripción); null si no recibe avisos de esta cuenta. */
  abstract getSuscripcionPush(endpoint: string): Observable<PreferenciasPush | null>;
  abstract guardarSuscripcionPush(suscripcion: SuscripcionPush): Observable<boolean>;
  abstract quitarSuscripcionPush(endpoint: string): Observable<boolean>;
  /** Notificación de prueba a este dispositivo: `estado` es lo que respondió el servicio push del navegador. */
  abstract probarPush(endpoint: string): Observable<{ estado: number; entregado: boolean; vencida: boolean }>;
}

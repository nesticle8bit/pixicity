import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private connection?: HubConnection;

  private notificationSubject = new Subject<any>();
  private newReportSubject = new Subject<any>();

  // Notificación personal en tiempo real (campana).
  public notification$: Observable<any> = this.notificationSubject.asObservable();
  // Nuevo reporte para staff.
  public newReport$: Observable<any> = this.newReportSubject.asObservable();

  // Inicia la conexión y se suscribe a los grupos del usuario. Idempotente.
  async start(token: string): Promise<void> {
    if (!token) {
      return;
    }

    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${environment.api}/api/hubs/notifications`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Error)
      .build();

    this.connection.on('notification', (payload: any) => this.notificationSubject.next(payload));
    this.connection.on('newReport', (payload: any) => this.newReportSubject.next(payload));

    // Tras reconectar hay que volver a suscribirse a los grupos.
    this.connection.onreconnected(() => this.subscribe(token));

    try {
      await this.connection.start();
      await this.subscribe(token);
    } catch {
      // Silencioso: la app funciona sin realtime (degradación elegante).
    }
  }

  private async subscribe(token: string): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('Subscribe', token);
      } catch {
        // ignorar
      }
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // ignorar
      }
      this.connection = undefined;
    }
  }
}

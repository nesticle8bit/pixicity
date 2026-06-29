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
  private actividadSubject = new Subject<any>();
  private handlersBound = false;

  // Notificación personal en tiempo real (campana).
  public notification$: Observable<any> = this.notificationSubject.asObservable();
  // Nuevo reporte para staff.
  public newReport$: Observable<any> = this.newReportSubject.asObservable();
  // Actividad pública en tiempo real (página "En Vivo").
  public actividad$: Observable<any> = this.actividadSubject.asObservable();

  // Inicia la conexión y se suscribe a los grupos del usuario. Idempotente.
  async start(token: string): Promise<void> {
    if (!token) {
      return;
    }

    await this.ensureStarted();

    // Tras reconectar hay que volver a suscribirse a los grupos.
    this.connection!.onreconnected(() => this.subscribe(token));

    try {
      await this.subscribe(token);
    } catch {
      // Silencioso: la app funciona sin realtime (degradación elegante).
    }
  }

  // Crea (si hace falta) e inicia la conexión, registrando los handlers una sola vez. Idempotente.
  private async ensureStarted(): Promise<void> {
    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(`${environment.api}/api/hubs/notifications`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Error)
        .build();
    }

    if (!this.handlersBound) {
      this.connection.on('notification', (payload: any) => this.notificationSubject.next(payload));
      this.connection.on('newReport', (payload: any) => this.newReportSubject.next(payload));
      this.connection.on('actividad', (payload: any) => this.actividadSubject.next(payload));
      this.handlersBound = true;
    }

    if (this.connection.state === HubConnectionState.Disconnected) {
      try {
        await this.connection.start();
      } catch {
        // Silencioso: la app funciona sin realtime (degradación elegante).
      }
    }
  }

  // Suscripción pública al feed "En Vivo" (no requiere token; sirve para anónimos).
  async startEnVivo(): Promise<void> {
    await this.ensureStarted();

    // Reengancha la suscripción tras reconectar.
    this.connection!.onreconnected(() => this.invokeEnVivo());
    await this.invokeEnVivo();
  }

  private async invokeEnVivo(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SubscribeEnVivo');
      } catch {
        // ignorar
      }
    }
  }

  // Sale del grupo "En Vivo" sin cerrar la conexión (puede seguir usándose para notificaciones).
  async stopEnVivo(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('UnsubscribeEnVivo');
      } catch {
        // ignorar
      }
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
      this.handlersBound = false;
    }
  }
}

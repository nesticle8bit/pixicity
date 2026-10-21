import { Injectable, Injector, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import {
  ActividadEnVivo,
  EventoDeUsuario,
  MensajeEnVivo,
  NotificacionEnVivo,
  ReporteEnVivo,
} from 'src/app/models/shared/realtime.model';
import { PostVotadoEnVivo } from 'src/app/models/posts/post-vm.model';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';

/** "v" va en la URL al volver a pedir la lista, para no recibir la copia que guardó el navegador. */
export interface HomeActualizado {
  lista: 'posts' | 'usuarios';
  v: number;
}

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private injector = inject(Injector);
  private esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  private connection?: HubConnection;

  private notificationSubject = new Subject<NotificacionEnVivo>();
  private newReportSubject = new Subject<ReporteEnVivo>();
  private actividadSubject = new Subject<ActividadEnVivo>();
  private mensajeSubject = new Subject<MensajeEnVivo>();
  private mensajesLeidosSubject = new Subject<EventoDeUsuario>();
  private escribiendoSubject = new Subject<EventoDeUsuario>();
  private shoutNuevoSubject = new Subject<{ shoutId: number; autor: string }>();
  private postVotadoSubject = new Subject<PostVotadoEnVivo>();
  private homeActualizadoSubject = new Subject<HomeActualizado>();
  private handlersBound = false;

  /** Qué grupos volver a pedir al reconectar. */
  private suscritoUsuario = false;
  private suscritoEnVivo = false;
  /** Posts abiertos (grupo "post-{id}"): reciben "postVotado". */
  private postsSuscritos = new Set<number>();
  /** Componentes del home que escuchan "homeActualizado" (últimos posts y usuarios comparten el grupo). */
  private suscritosHome = 0;

  // Notificación personal en tiempo real (campana).
  public notification$: Observable<NotificacionEnVivo> = this.notificationSubject.asObservable();
  // Nuevo reporte para staff.
  public newReport$: Observable<ReporteEnVivo> = this.newReportSubject.asObservable();
  // Actividad pública en tiempo real (página "En Vivo").
  public actividad$: Observable<ActividadEnVivo> = this.actividadSubject.asObservable();
  // Mensaje privado nuevo (recibido o enviado desde otra pestaña).
  public mensaje$: Observable<MensajeEnVivo> = this.mensajeSubject.asObservable();
  // El otro usuario leyó mis mensajes.
  public mensajesLeidos$: Observable<EventoDeUsuario> = this.mensajesLeidosSubject.asObservable();
  // El otro usuario está escribiéndome.
  public escribiendo$: Observable<EventoDeUsuario> = this.escribiendoSubject.asObservable();
  // Alguien que sigo publicó un shout (el muro de /mi ofrece "ver nuevos").
  public shoutNuevo$: Observable<{ shoutId: number; autor: string }> = this.shoutNuevoSubject.asObservable();
  // Alguien dio puntos a un post que tengo abierto.
  public postVotado$: Observable<PostVotadoEnVivo> = this.postVotadoSubject.asObservable();
  // Cambió una lista del home (últimos posts o últimos usuarios registrados).
  public homeActualizado$: Observable<HomeActualizado> = this.homeActualizadoSubject.asObservable();

  // Inicia la conexión y se suscribe a los grupos del usuario. Idempotente.
  async start(token: string): Promise<void> {
    if (!token) {
      return;
    }

    await this.ensureStarted();
    this.suscritoUsuario = true;

    try {
      await this.subscribe(token);
    } catch {
      // Silencioso: la app funciona sin realtime (degradación elegante).
    }
  }

  /**
   * Token vigente al reconectar. El JWT se renueva cada hora y la sesión pasa a validar el token nuevo: reusar el que se
   * tenía al conectar dejaba al usuario sin notificaciones en vivo después de la primera reconexión.
   */
  private tokenActual(): string | undefined {
    try {
      return this.injector.get(IHttpSecurityService).getCurrentUser()?.token || undefined;
    } catch {
      return undefined;
    }
  }

  private async alReconectar(): Promise<void> {
    const token = this.tokenActual();
    if (this.suscritoUsuario && token) {
      await this.subscribe(token);
    }
    if (this.suscritoEnVivo) {
      await this.invokeEnVivo();
    }
    if (this.suscritosHome > 0) {
      await this.invocar('SubscribeHome');
    }
    for (const postId of this.postsSuscritos) {
      await this.invocar('SubscribePost', postId);
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
      this.connection.on('notification', (payload: NotificacionEnVivo) => this.notificationSubject.next(payload));
      this.connection.on('newReport', (payload: ReporteEnVivo) => this.newReportSubject.next(payload));
      this.connection.on('actividad', (payload: ActividadEnVivo) => this.actividadSubject.next(payload));
      this.connection.on('mensaje', (payload: MensajeEnVivo) => this.mensajeSubject.next(payload));
      this.connection.on('mensajesLeidos', (payload: EventoDeUsuario) => this.mensajesLeidosSubject.next(payload));
      this.connection.on('escribiendo', (payload: EventoDeUsuario) => this.escribiendoSubject.next(payload));
      this.connection.on('postVotado', (payload: PostVotadoEnVivo) => this.postVotadoSubject.next(payload));
      this.connection.on('homeActualizado', (payload: HomeActualizado) => this.homeActualizadoSubject.next(payload));
      this.connection.on('shoutNuevo', (payload: { shoutId: number; autor: string }) => this.shoutNuevoSubject.next(payload));
      // Un solo manejador de reconexión: antes cada start()/startEnVivo() agregaba uno más.
      this.connection.onreconnected(() => this.alReconectar());
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

  /** Listas en vivo del home (público, sirve sin sesión). Con contador: cada widget llama start/stop. */
  async startHome(): Promise<void> {
    if (!this.esNavegador) return;
    if (this.suscritosHome++ > 0) return;
    await this.ensureStarted();
    await this.invocar('SubscribeHome');
  }

  async stopHome(): Promise<void> {
    if (this.suscritosHome === 0 || --this.suscritosHome > 0) return;
    await this.invocar('UnsubscribeHome');
  }

  /** Puntos en vivo de un post (público, sirve sin sesión). */
  async startPost(postId: number): Promise<void> {
    this.postsSuscritos.add(postId);
    await this.ensureStarted();
    await this.invocar('SubscribePost', postId);
  }

  async stopPost(postId: number): Promise<void> {
    if (!this.postsSuscritos.delete(postId)) return;
    await this.invocar('UnsubscribePost', postId);
  }

  private async invocar(metodo: string, ...args: unknown[]): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke(metodo, ...args);
      } catch {
        // ignorar: sin realtime los puntos se ven al recargar
      }
    }
  }

  // Suscripción pública al feed "En Vivo" (no requiere token; sirve para anónimos).
  async startEnVivo(): Promise<void> {
    await this.ensureStarted();
    this.suscritoEnVivo = true;
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
    this.suscritoEnVivo = false;
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

  // Avisa al otro usuario que estoy escribiéndole. Efímero: si no hay conexión simplemente no hace nada.
  async notifyTyping(otroId: number): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('Escribiendo', otroId);
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
      this.suscritoUsuario = false;
      this.suscritoEnVivo = false;
      this.postsSuscritos.clear();
      this.suscritosHome = 0;
    }
  }
}

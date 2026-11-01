import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PreferenciasPush } from 'src/app/models/logs/logs-vm.model';
import { enNavegador } from 'src/app/shared/helpers/plataforma';
import { IHttpLogsService } from '../interfaces/httpLogs.interface';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { AppInstalableService } from './app-instalable.service';

/**
 * - `no-soportado`: el navegador no tiene Web Push (o es desarrollo, donde no hay service worker).
 * - `ios-instalar`: iPhone/iPad en Safari; solo la app agregada a inicio puede recibirlas.
 * - `sin-servidor`: el API no tiene claves VAPID.
 * - `bloqueado`: el usuario las bloqueó en el navegador (solo se pueden volver a permitir desde ahí).
 */
export type EstadoPush = 'cargando' | 'no-soportado' | 'ios-instalar' | 'sin-servidor' | 'bloqueado' | 'inactivo' | 'activo';

/** Clave VAPID (base64url) como la pide pushManager.subscribe. */
export function claveAplicacion(base64Url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

/** Mismos bytes: ArrayBuffer de la suscripción contra la clave del servidor. */
function mismaClave(actual: ArrayBuffer | null | undefined, clave: Uint8Array): boolean {
  if (!actual || actual.byteLength !== clave.length) return false;
  const a = new Uint8Array(actual);
  return a.every((b, i) => b === clave[i]);
}

/** Cuánto se espera al service worker (en desarrollo no se registra y `ready` no resuelve nunca). */
const ESPERA_SW_MS = 5_000;

/**
 * Notificaciones de escritorio (Web Push) de mensajes y de la campana, por dispositivo. El API las envía aunque el sitio
 * esté cerrado; sw.js las muestra (salvo que el sitio esté a la vista: ahí ya se ven en vivo) y al tocarlas abre su
 * enlace. Al cerrar sesión este navegador deja de recibir los avisos de esa cuenta.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesEscritorioService {
  private readonly logs = inject(IHttpLogsService);
  private readonly seguridad = inject(IHttpSecurityService);
  private readonly router = inject(Router);
  private readonly app = inject(AppInstalableService);

  readonly estado = signal<EstadoPush>('cargando');
  readonly preferencias = signal<PreferenciasPush>({ mensajes: true, notificaciones: true });
  readonly ocupado = signal(false);

  private clave: string | null | undefined;
  /** Endpoint de la suscripción de este navegador, para darlo de baja al cerrar sesión sin esperar nada. */
  private endpoint: string | null = null;
  private iniciado = false;

  iniciar(): void {
    if (this.iniciado || !enNavegador()) return;
    this.iniciado = true;

    if ('serviceWorker' in navigator) {
      // Al tocar una notificación con el sitio abierto, sw.js enfoca la pestaña y pide navegar acá (sin recargar).
      navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
        const url = e.data?.tipo === 'abrir' ? e.data.url : null;
        if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) void this.router.navigateByUrl(url);
      });
    }

    this.seguridad
      .getCurrentUserAsObservable()
      .pipe(
        map((u) => (u?.usuario && u.token ? u.usuario.userName : null)),
        distinctUntilChanged(),
      )
      .subscribe((usuario) => {
        if (usuario) void this.actualizar();
        else this.olvidar();
      });
  }

  /** Revisa el estado de este dispositivo. Si la clave del servidor cambió, vuelve a suscribirlo solo. */
  async actualizar(): Promise<void> {
    if (!this.soportado()) {
      this.estado.set(this.app.esIos() && !this.app.instalada() ? 'ios-instalar' : 'no-soportado');
      return;
    }
    try {
      this.clave ??= await firstValueFrom(this.logs.getClavePush());
    } catch {
      this.clave = undefined;
      this.estado.set('sin-servidor');
      return;
    }
    if (!this.clave) return this.estado.set('sin-servidor');
    if (Notification.permission === 'denied') return this.estado.set('bloqueado');

    const registro = await this.registro();
    if (!registro) return this.estado.set('no-soportado');
    let suscripcion = await registro.pushManager.getSubscription();
    if (!suscripcion || Notification.permission !== 'granted') {
      this.endpoint = null;
      return this.estado.set('inactivo');
    }

    try {
      const guardadas = await firstValueFrom(this.logs.getSuscripcionPush(suscripcion.endpoint));
      if (!guardadas) {
        this.endpoint = null;
        return this.estado.set('inactivo');
      }
      this.preferencias.set({ mensajes: guardadas.mensajes, notificaciones: guardadas.notificaciones });

      const clave = claveAplicacion(this.clave);
      if (!mismaClave(suscripcion.options?.applicationServerKey, clave)) {
        // Se cambiaron las claves VAPID: la suscripción vieja ya no sirve. Con el permiso dado no se vuelve a preguntar.
        await suscripcion.unsubscribe();
        suscripcion = await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: clave });
        await this.guardar(suscripcion);
      }
      this.endpoint = suscripcion.endpoint;
      this.estado.set('activo');
    } catch {
      this.estado.set('inactivo');
    }
  }

  /** Pide permiso (tiene que llamarse desde un clic) y suscribe este dispositivo. Devuelve si quedó activo. */
  async activar(): Promise<boolean> {
    if (!this.clave || !this.soportado()) return false;
    // Primero el permiso, sin nada asíncrono antes: Safari solo lo muestra dentro del clic.
    const permiso = await Notification.requestPermission();
    if (permiso !== 'granted') {
      this.estado.set(permiso === 'denied' ? 'bloqueado' : 'inactivo');
      return false;
    }

    this.ocupado.set(true);
    try {
      const registro = await this.registro();
      if (!registro) throw new Error('Sin service worker');
      const clave = claveAplicacion(this.clave);
      let suscripcion = await registro.pushManager.getSubscription();
      if (suscripcion && !mismaClave(suscripcion.options?.applicationServerKey, clave)) {
        await suscripcion.unsubscribe();
        suscripcion = null;
      }
      suscripcion ??= await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: clave });
      await this.guardar(suscripcion);
      this.endpoint = suscripcion.endpoint;
      this.estado.set('activo');
      return true;
    } catch {
      this.estado.set('inactivo');
      return false;
    } finally {
      this.ocupado.set(false);
    }
  }

  /** Cambia qué avisa este dispositivo (mensajes y/o campana). */
  async cambiar(preferencias: PreferenciasPush): Promise<void> {
    const anterior = this.preferencias();
    this.preferencias.set(preferencias);
    this.ocupado.set(true);
    try {
      const suscripcion = await (await this.registro())?.pushManager.getSubscription();
      if (!suscripcion) throw new Error('Sin suscripción');
      await this.guardar(suscripcion);
    } catch (e) {
      this.preferencias.set(anterior);
      throw e;
    } finally {
      this.ocupado.set(false);
    }
  }

  async desactivar(): Promise<void> {
    this.ocupado.set(true);
    try {
      const suscripcion = await (await this.registro())?.pushManager.getSubscription();
      if (suscripcion) {
        await firstValueFrom(this.logs.quitarSuscripcionPush(suscripcion.endpoint));
        await suscripcion.unsubscribe();
      }
      this.endpoint = null;
      this.estado.set('inactivo');
    } finally {
      this.ocupado.set(false);
    }
  }

  /**
   * Al cerrar sesión: el API deja de avisar a este navegador. Con keepalive y sin token, porque la página se recarga
   * enseguida y el token puede estar vencido (DELETE api/push/suscripcion solo pide el endpoint).
   */
  private olvidar(): void {
    const endpoint = this.endpoint;
    this.endpoint = null;
    if (this.estado() === 'activo') this.estado.set('inactivo');
    if (!endpoint) return;
    void fetch(`${environment.api}/api/push/suscripcion?endpoint=${encodeURIComponent(endpoint)}`, { method: 'DELETE', keepalive: true }).catch(() => undefined);
    void navigator.serviceWorker?.getRegistration().then((r) => r?.pushManager.getSubscription()).then((s) => s?.unsubscribe()).catch(() => undefined);
  }

  private soportado(): boolean {
    return enNavegador() && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  private async registro(): Promise<ServiceWorkerRegistration | null> {
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ESPERA_SW_MS)),
    ]);
  }

  private async guardar(suscripcion: PushSubscription): Promise<void> {
    const { keys } = suscripcion.toJSON();
    await firstValueFrom(
      this.logs.guardarSuscripcionPush({
        endpoint: suscripcion.endpoint,
        p256dh: keys?.['p256dh'] ?? '',
        auth: keys?.['auth'] ?? '',
        ...this.preferencias(),
      }),
    );
  }
}

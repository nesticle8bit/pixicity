import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HTTP_ERROR_GENERICO } from 'src/app/services/shared/helper.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { environment } from 'src/environments/environment';
import { enNavegador } from '../helpers/plataforma';

interface ClienteLog {
  nivel: 'Warning' | 'Error';
  tipo: string;
  mensaje: string;
  stackTrace?: string;
  ruta: string;
  statusCode?: number;
  /** Versión (hash del bundle), pantallas previas, viewport y conexión. */
  contexto?: string;
}

// Límites para que un error en bucle (p. ej. dentro de un *ngFor) no inunde el API ni la tabla de logs.
const MAX_POR_SESION = 20;
const VENTANA_REPETIDO_MS = 60 * 1000;
/** Pantallas previas que acompañan al error (las más recientes). */
const MAX_NAVEGACION = 6;
/** Tras un despliegue, el navegador con la versión vieja pide chunks que ya no existen. */
const CHUNK_PERDIDO = /Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;
const CLAVE_RECARGA = 'pixicity:recarga-por-version';
/** Una recarga automática como máximo cada 5 minutos (si el chunk sigue faltando, no se entra en bucle). */
const RECARGA_CADA_MS = 5 * 60 * 1000;

/**
 * Envía al API (Logs.AppLogs, visible en el panel admin) los errores no controlados del navegador: los de Angular,
 * los de scripts fuera de Angular (window.onerror) y las promesas rechazadas sin catch. Usa HttpBackend para no pasar
 * por los interceptores: si el envío falla, no debe generar otro error que reportar.
 */
@Injectable()
export class ClientErrorHandler implements ErrorHandler {
  private readonly http: HttpClient;
  private readonly injector = inject(Injector);
  private enviados = 0;
  private readonly ultimos = new Map<string, number>();
  private readonly navegacion: string[] = [];

  constructor() {
    const httpBackend = inject(HttpBackend);

    this.http = new HttpClient(httpBackend);

    if (enNavegador()) {
      this.escucharFueraDeAngular();
      // El Router todavía no existe al crear el ErrorHandler: se engancha cuando termina el arranque.
      setTimeout(() => this.seguirNavegacion());
    }
  }

  handleError(error: unknown): void {
    console.error(error);

    try {
      const log = this.construir(error);
      if (!log) return;

      if (log.tipo === 'ChunkLoadError') this.recargarPorVersionNueva();
      if (this.debeEnviar(log)) this.enviar(log);
    } catch {
      // Reportar un error nunca debe romper la app.
    }
  }

  private enviar(log: ClienteLog): void {
    log.contexto = this.contexto();
    // Con el token el API sabe qué usuario tuvo el error (el JWT se valida igual que en cualquier pedido).
    const token = this.token();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.http.post(`${environment.api}/api/appLogs/cliente`, log, { headers }).subscribe({ error: () => undefined });
  }

  private construir(error: unknown): ClienteLog | null {
    const original = (error as any)?.rejection ?? (error as any)?.originalError ?? error;
    const ruta = enNavegador() ? window.location.pathname + window.location.search : '(servidor)';

    if (original instanceof HttpErrorResponse) {
      // Los errores HTTP con respuesta del API ya quedan registrados en el servidor; aquí solo interesan los de red.
      if (original.status !== 0) {
        return null;
      }
      return { nivel: 'Warning', tipo: 'HttpError', mensaje: `Sin conexión con ${original.url ?? 'el API'}`, ruta, statusCode: 0 };
    }

    if (original instanceof Error) {
      const mensaje = original.message || String(original);
      if (CHUNK_PERDIDO.test(mensaje)) {
        return { nivel: 'Warning', tipo: 'ChunkLoadError', mensaje, stackTrace: original.stack, ruta };
      }
      return { nivel: 'Error', tipo: original.name || 'Error', mensaje, stackTrace: original.stack, ruta };
    }

    if (original === HTTP_ERROR_GENERICO) {
      return null;
    }

    if (typeof original === 'string') {
      return { nivel: 'Error', tipo: CHUNK_PERDIDO.test(original) ? 'ChunkLoadError' : 'Error', mensaje: original, ruta };
    }

    return null;
  }

  /** Errores que no pasan por Angular: scripts de terceros, callbacks sueltos, promesas sin catch. */
  private escucharFueraDeAngular(): void {
    window.addEventListener('error', (e: ErrorEvent) => {
      // Sin e.error es un recurso que no cargó (img, css): lo cubre el navegador, no es un error de la app.
      // "Script error." = script de otro origen sin CORS: no trae ningún dato útil.
      if (!e.error && (!e.message || e.message === 'Script error.')) return;
      this.handleError(e.error ?? e.message);
    });
    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
      const razon = e.reason;
      this.handleError(razon instanceof Error || typeof razon === 'string' ? razon : new Error(`Promesa rechazada: ${String(razon)}`));
    });
  }

  private seguirNavegacion(): void {
    try {
      const router = this.injector.get(Router, null);
      router?.events.subscribe((e) => {
        if (!(e instanceof NavigationEnd)) return;
        this.navegacion.push(e.urlAfterRedirects);
        if (this.navegacion.length > MAX_NAVEGACION) this.navegacion.shift();
      });
    } catch {
      // Sin Router (tests, SSR): el log sale sin navegación.
    }
  }

  /** Recarga una vez para traer la versión nueva cuando faltan chunks de la vieja. */
  private recargarPorVersionNueva(): void {
    if (!enNavegador()) return;
    try {
      const ultima = Number(sessionStorage.getItem(CLAVE_RECARGA) || 0);
      if (Date.now() - ultima < RECARGA_CADA_MS) return;
      sessionStorage.setItem(CLAVE_RECARGA, String(Date.now()));
    } catch {
      return; // sin sessionStorage no se puede evitar un bucle: mejor no recargar
    }
    // Deja salir el log antes de recargar.
    setTimeout(() => window.location.reload(), 300);
  }

  private contexto(): string | undefined {
    if (!enNavegador()) return undefined;
    try {
      const conexion = (navigator as any).connection;
      const lineas = [
        `Versión: ${this.version()}`,
        `Viewport: ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio || 1}x`,
        `Idioma: ${navigator.language}`,
        conexion?.effectiveType ? `Conexión: ${conexion.effectiveType}${navigator.onLine ? '' : ' (sin conexión)'}` : null,
        this.navegacion.length ? `Navegación: ${this.navegacion.join(' → ')}` : null,
      ];
      return lineas.filter(Boolean).join('\n');
    } catch {
      return undefined;
    }
  }

  /** El hash del bundle principal identifica el despliegue (main-ABC123.js). */
  private version(): string {
    const main = [...document.scripts].map((s) => s.src).find((src) => /\/main[-.][\w]+\.js/.test(src));
    return main?.match(/main[-.]([\w]+)\.js/)?.[1] ?? 'dev';
  }

  private token(): string | undefined {
    try {
      return this.injector.get(IHttpSecurityService, null)?.getCurrentUser()?.token || undefined;
    } catch {
      return undefined;
    }
  }

  private debeEnviar(log: ClienteLog): boolean {
    if (this.enviados >= MAX_POR_SESION) {
      return false;
    }

    const clave = `${log.tipo}|${log.mensaje}`;
    const ahora = Date.now();
    const ultimo = this.ultimos.get(clave);
    if (ultimo && ahora - ultimo < VENTANA_REPETIDO_MS) {
      return false;
    }

    this.ultimos.set(clave, ahora);
    this.enviados++;
    return true;
  }
}

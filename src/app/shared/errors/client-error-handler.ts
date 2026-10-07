import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { HTTP_ERROR_GENERICO } from 'src/app/services/shared/helper.service';
import { environment } from 'src/environments/environment';

interface ClienteLog {
  nivel: 'Warning' | 'Error';
  tipo: string;
  mensaje: string;
  stackTrace?: string;
  ruta: string;
  statusCode?: number;
}

// Límites para que un error en bucle (p. ej. dentro de un *ngFor) no inunde el API ni la tabla de logs.
const MAX_POR_SESION = 20;
const VENTANA_REPETIDO_MS = 60 * 1000;

/**
 * Envía al API (Logs.AppLogs, visible en el panel admin) los errores no controlados del navegador.
 * Usa HttpBackend para no pasar por los interceptores: si el envío falla, no debe generar otro error que reportar.
 */
@Injectable()
export class ClientErrorHandler implements ErrorHandler {
  private readonly http: HttpClient;
  private enviados = 0;
  private readonly ultimos = new Map<string, number>();

  constructor(httpBackend: HttpBackend) {
    this.http = new HttpClient(httpBackend);
  }

  handleError(error: unknown): void {
    console.error(error);

    try {
      const log = this.construir(error);
      if (log && this.debeEnviar(log)) {
        this.http.post(`${environment.api}/api/appLogs/cliente`, log).subscribe({ error: () => undefined });
      }
    } catch {
      // Reportar un error nunca debe romper la app.
    }
  }

  private construir(error: unknown): ClienteLog | null {
    const original = (error as any)?.rejection ?? (error as any)?.originalError ?? error;
    const ruta = window.location.pathname + window.location.search;

    if (original instanceof HttpErrorResponse) {
      // Los errores HTTP con respuesta del API ya quedan registrados en el servidor; aquí solo interesan los de red.
      if (original.status !== 0) {
        return null;
      }
      return { nivel: 'Warning', tipo: 'HttpError', mensaje: `Sin conexión con ${original.url ?? 'el API'}`, ruta, statusCode: 0 };
    }

    if (original instanceof Error) {
      return { nivel: 'Error', tipo: original.name || 'Error', mensaje: original.message || String(original), stackTrace: original.stack, ruta };
    }

    if (original === HTTP_ERROR_GENERICO) {
      return null;
    }

    if (typeof original === 'string') {
      return { nivel: 'Error', tipo: 'Error', mensaje: original, ruta };
    }

    return null;
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

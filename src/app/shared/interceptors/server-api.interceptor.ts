import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable, RESPONSE_INIT } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SsrSalud } from '../helpers/ssr-salud';

/**
 * Solo en el render del servidor (SSR para bots). Las URLs del API son relativas ("/api/...") porque en el navegador
 * nginx las proxea; en Node no hay nginx delante, así que se mandan directo al API por la red interna
 * (API_INTERNAL_URL, p. ej. http://192.168.1.3:5000). También marca la petición con X-Prerender para que el API
 * no cuente el render de un bot como una visita al post.
 *
 * Si el API falla por infraestructura la respuesta del render pasa a 503 (ver SsrSalud): un 404 haría que Google
 * desindexara páginas que existen.
 */
@Injectable()
export class ServerApiInterceptor implements HttpInterceptor {
  private readonly apiInterna = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env['API_INTERNAL_URL']
    ?.replace(/\/+$/, '');
  private readonly salud = inject(SsrSalud, { optional: true });
  private readonly respuesta = inject(RESPONSE_INIT, { optional: true });

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req.clone({ url: this.reescribir(req.url), setHeaders: { 'X-Prerender': '1' } })).pipe(
      catchError((error: unknown) => {
        if (ServerApiInterceptor.esFalloDeInfraestructura(error)) {
          if (this.salud) this.salud.apiFallo = true;
          if (this.respuesta) this.respuesta.status = 503;
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Sin respuesta, 5xx, o un 4xx que no viene del API (el API siempre responde con su JSON {status, errors, data};
   * p. ej. el 400 "Invalid Hostname" de AllowedHosts no lo trae). Un 400/404 del API con su JSON es "no existe".
   */
  static esFalloDeInfraestructura(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return true;
    }
    if (error.status === 0 || error.status >= 500) {
      return true;
    }
    const cuerpo = error.error as { status?: unknown } | null;
    return !(cuerpo && typeof cuerpo === 'object' && 'status' in cuerpo);
  }

  /** "/api/x", "{environment.api}/api/x" o "https://taringas.net/api/x" -> "{API_INTERNAL_URL}/api/x". Otras URLs no se tocan. */
  reescribir(url: string): string {
    if (!this.apiInterna) {
      return url;
    }
    const base = [environment.api, environment.publicUrl].find((b) => b && url.startsWith(b + '/'));
    const ruta = url.startsWith('/') ? url : base ? url.slice(base.length) : null;
    return ruta !== null && /^\/(api|images)\//.test(ruta) ? `${this.apiInterna}${ruta}` : url;
  }
}

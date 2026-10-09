import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Solo en el render del servidor (SSR para bots). Las URLs del API son relativas ("/api/...") porque en el navegador
 * nginx las proxea; en Node no hay nginx delante, así que se mandan directo al API por la red interna
 * (API_INTERNAL_URL, p. ej. http://192.168.1.3:5000). También marca la petición con X-Prerender para que el API
 * no cuente el render de un bot como una visita al post.
 */
@Injectable()
export class ServerApiInterceptor implements HttpInterceptor {
  private readonly apiInterna = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env['API_INTERNAL_URL']
    ?.replace(/\/+$/, '');

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req.clone({ url: this.reescribir(req.url), setHeaders: { 'X-Prerender': '1' } }));
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

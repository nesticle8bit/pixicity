import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

// Cabecera con la que el API marca un 401 por JWT vencido aunque traiga cuerpo JSON.
export const TOKEN_EXPIRADO_HEADER = 'Token-Expired';

/** El cuerpo estándar del API: { status, errors, data }. */
export function esRespuestaApi(body: unknown): body is { status: number; errors: string[] } {
  return !!body && typeof body === 'object' && typeof (body as any).status === 'number' && Array.isArray((body as any).errors);
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  // 401 = access JWT vencido; 423 (Locked) = sesión vencida. Ambos se intentan refrescar.
  private readonly refreshableStatuses = [401, 423];

  constructor(
    private securityService: IHttpSecurityService,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (!(err instanceof HttpErrorResponse)) {
          return throwError(() => err);
        }

        if (this.debeRenovar(err, request)) {
          return this.renovarYReintentar(request, next);
        }

        return this.entregar(err);
      })
    );
  }

  // El API responde con el código HTTP real pero el mismo cuerpo de siempre: los servicios lo leen
  // (response.status / response.errors) y deciden. Por eso se entrega como respuesta normal.
  private entregar(err: unknown): Observable<HttpEvent<any>> {
    if (err instanceof HttpErrorResponse && esRespuestaApi(err.error)) {
      return of(
        new HttpResponse({ body: err.error, headers: err.headers, status: err.status, statusText: err.statusText, url: err.url ?? undefined })
      );
    }

    const error = err instanceof HttpErrorResponse ? err.error || err.statusText : err;
    return throwError(() => error);
  }

  private debeRenovar(err: HttpErrorResponse, request: HttpRequest<any>): boolean {
    const currentUser = this.securityService.getCurrentUser();
    const hasSession = !!(currentUser && currentUser.token);

    if (!hasSession || !this.refreshableStatuses.includes(err.status) || request.url.includes('/refreshToken')) {
      return false;
    }

    // Un 401 con cuerpo JSON es de negocio (p. ej. "no tienes permiso"), salvo que el API lo marque como token vencido.
    return !esRespuestaApi(err.error) || err.headers?.get(TOKEN_EXPIRADO_HEADER) === 'true';
  }

  private renovarYReintentar(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.securityService.refreshAccessToken().pipe(
      catchError((refreshErr) => {
        // Refresh falló: sesión muerta. Se avisa antes de volver al inicio para que no parezca un error de la página.
        this.notificationService.warning('Tu sesión expiró. Vuelve a iniciar sesión para continuar.', 'Sesión');
        this.securityService.logout();
        return throwError(() => refreshErr);
      }),
      switchMap((newToken) =>
        next
          .handle(request.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))
          .pipe(catchError((err) => this.entregar(err)))
      )
    );
  }
}

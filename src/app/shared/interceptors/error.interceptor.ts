import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  // 401 = access JWT vencido; 423 (Locked) = sesión vencida. Ambos se intentan refrescar.
  private readonly refreshableStatuses = [401, 423];

  constructor(private securityService: IHttpSecurityService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        const currentUser = this.securityService.getCurrentUser();
        const hasSession = !!(currentUser && currentUser.token);

        if (
          err instanceof HttpErrorResponse &&
          this.refreshableStatuses.includes(err.status) &&
          hasSession &&
          !request.url.includes('/refreshToken')
        ) {
          return this.handleRefresh(request, next);
        }

        const error = err.error || err.statusText;
        return throwError(error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  private handleRefresh(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Si ya hay un refresh en curso, las demás requests esperan el nuevo token.
    if (this.isRefreshing) {
      return this.refreshSubject.pipe(
        filter((t) => t !== null),
        take(1),
        switchMap((t) => next.handle(this.addToken(request, t as string)))
      );
    }

    this.isRefreshing = true;
    this.refreshSubject.next(null);

    return this.securityService.refreshAccessToken().pipe(
      switchMap((newToken) => {
        this.refreshSubject.next(newToken);
        return next.handle(this.addToken(request, newToken));
      }),
      catchError((refreshErr) => {
        // Refresh falló: sesión muerta, cerrar y volver al inicio.
        this.securityService.logout();
        window.location.href = '';
        return throwError(refreshErr);
      }),
      finalize(() => {
        this.isRefreshing = false;
      })
    );
  }
}

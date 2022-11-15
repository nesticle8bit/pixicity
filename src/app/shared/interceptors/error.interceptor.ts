import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private securityService: IHttpSecurityService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        // Si el jwt se encuentra vencido o eliminado
        if (err.status === 423) {
          this.securityService.logout();

          if (isPlatformBrowser(this.platformId)) {
            window.location.href = '';
          }
        }

        const error = err.error || err.statusText;
        return throwError(error);
      })
    );
  }
}

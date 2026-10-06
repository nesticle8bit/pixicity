import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

// Margen para renovar antes de que venza: cubre la latencia y relojes algo desfasados.
const MARGEN_EXPIRACION_MS = 60 * 1000;

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private securityService: IHttpSecurityService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentUser = this.securityService.getCurrentUser();

        if (!currentUser?.token) {
            return next.handle(request);
        }

        // Los endpoints públicos no responden 401 con un JWT vencido: tratan al usuario como anónimo.
        // Por eso se renueva antes de enviar, en vez de esperar al 401 del ErrorInterceptor.
        if (currentUser.refreshToken && !request.url.includes('/refreshToken') && this.porVencer(currentUser.token)) {
            return this.securityService.refreshAccessToken().pipe(
                // Si la renovación falla se envía con el token viejo: los endpoints protegidos
                // responderán 401/423 y el ErrorInterceptor cerrará la sesión.
                catchError(() => of(currentUser.token)),
                switchMap((token) => next.handle(this.conToken(request, token)))
            );
        }

        return next.handle(this.conToken(request, currentUser.token));
    }

    private conToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    private porVencer(token: string): boolean {
        try {
            const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const { exp } = JSON.parse(atob(payload));
            return typeof exp === 'number' && exp * 1000 - MARGEN_EXPIRACION_MS < Date.now();
        } catch {
            return false;
        }
    }
}

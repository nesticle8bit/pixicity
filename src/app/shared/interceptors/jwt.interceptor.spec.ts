import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { JwtInterceptor } from './jwt.interceptor';

/** JWT sin firma válida: al interceptor solo le importa el "exp" del payload. */
function jwtQueVence(segundosDesdeAhora: number): string {
  const base64url = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${base64url({ alg: 'HS256' })}.${base64url({ unique_name: 'ana', exp: Math.floor(Date.now() / 1000) + segundosDesdeAhora })}.firma`;
}

describe('JwtInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let security: jasmine.SpyObj<IHttpSecurityService>;

  beforeEach(() => {
    security = jasmine.createSpyObj<IHttpSecurityService>('IHttpSecurityService', ['getCurrentUser', 'refreshAccessToken']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: IHttpSecurityService, useValue: security },
      ],
    });

    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('sin sesión no agrega Authorization', () => {
    security.getCurrentUser.and.returnValue({ usuario: {}, token: '' } as any);
    http.get('/api/x').subscribe();

    expect(backend.expectOne('/api/x').request.headers.has('Authorization')).toBeFalse();
  });

  it('con un token vigente lo envía sin renovar', () => {
    const token = jwtQueVence(3600);
    security.getCurrentUser.and.returnValue({ usuario: {}, token, refreshToken: 'r' } as any);
    http.get('/api/x').subscribe();

    expect(backend.expectOne('/api/x').request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(security.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('con el token vencido (o por vencer) lo renueva antes de enviar: los endpoints públicos no darían 401', () => {
    security.getCurrentUser.and.returnValue({ usuario: {}, token: jwtQueVence(30), refreshToken: 'r' } as any);
    security.refreshAccessToken.and.returnValue(of('renovado'));
    http.get('/api/comunidades/getComunidad').subscribe();

    expect(backend.expectOne('/api/comunidades/getComunidad').request.headers.get('Authorization')).toBe('Bearer renovado');
  });

  it('si la renovación falla envía con el token viejo y deja que el ErrorInterceptor decida', () => {
    const viejo = jwtQueVence(-60);
    security.getCurrentUser.and.returnValue({ usuario: {}, token: viejo, refreshToken: 'r' } as any);
    security.refreshAccessToken.and.returnValue(throwError(() => new Error('no')));
    http.get('/api/x').subscribe();

    expect(backend.expectOne('/api/x').request.headers.get('Authorization')).toBe(`Bearer ${viejo}`);
  });

  it('la petición de renovación nunca se renueva a sí misma', () => {
    security.getCurrentUser.and.returnValue({ usuario: {}, token: jwtQueVence(-60), refreshToken: 'r' } as any);
    http.post('/api/usuarios/refreshToken', {}).subscribe();

    backend.expectOne('/api/usuarios/refreshToken');
    expect(security.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('un token ilegible no rompe la petición', () => {
    security.getCurrentUser.and.returnValue({ usuario: {}, token: 'no-es-un-jwt', refreshToken: 'r' } as any);
    http.get('/api/x').subscribe();

    expect(backend.expectOne('/api/x').request.headers.get('Authorization')).toBe('Bearer no-es-un-jwt');
  });
});

import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { ErrorInterceptor, TOKEN_EXPIRADO_HEADER } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let security: jasmine.SpyObj<IHttpSecurityService>;
  let notifications: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    security = jasmine.createSpyObj<IHttpSecurityService>('IHttpSecurityService', ['getCurrentUser', 'refreshAccessToken', 'logout']);
    security.getCurrentUser.and.returnValue({ usuario: {}, token: 'viejo', refreshToken: 'r1' } as any);
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', ['warning']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: IHttpSecurityService, useValue: security },
        { provide: NotificationService, useValue: notifications },
      ],
    });

    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('entrega como respuesta normal un error HTTP que trae el cuerpo estándar del API', () => {
    let body: any;
    http.get('/api/x').subscribe((r) => (body = r));

    backend.expectOne('/api/x').flush({ status: 400, errors: ['No puedes'], data: null }, { status: 400, statusText: 'Bad Request' });

    expect(body).toEqual({ status: 400, errors: ['No puedes'], data: null });
    expect(security.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('propaga como error lo que no es el cuerpo estándar (p. ej. un 500 de nginx)', () => {
    let error: any;
    http.get('/api/x').subscribe({ error: (e) => (error = e) });

    backend.expectOne('/api/x').flush('<html>502</html>', { status: 502, statusText: 'Bad Gateway' });

    expect(error).toBe('<html>502</html>');
  });

  it('con un 401 sin cuerpo (JWT vencido) renueva el token y repite la petición con el nuevo', () => {
    security.refreshAccessToken.and.returnValue(of('nuevo'));
    let body: any;
    http.get('/api/protegido').subscribe((r) => (body = r));

    backend.expectOne('/api/protegido').flush(null, { status: 401, statusText: 'Unauthorized' });
    const reintento = backend.expectOne('/api/protegido');
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer nuevo');
    reintento.flush({ status: 200, errors: [], data: 1 });

    expect(body.data).toBe(1);
    expect(security.refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('un 401 de negocio (con cuerpo JSON) no renueva el token', () => {
    let body: any;
    http.get('/api/x').subscribe((r) => (body = r));

    backend.expectOne('/api/x').flush({ status: 401, errors: ['Sin permiso'], data: null }, { status: 401, statusText: 'Unauthorized' });

    expect(security.refreshAccessToken).not.toHaveBeenCalled();
    expect(body.errors).toEqual(['Sin permiso']);
  });

  it('un 401 con cuerpo JSON pero marcado como token vencido sí renueva (post privado)', () => {
    security.refreshAccessToken.and.returnValue(of('nuevo'));
    http.get('/api/posts/getPostById').subscribe();

    backend.expectOne('/api/posts/getPostById').flush(
      { status: 401, errors: [], data: null },
      { status: 401, statusText: 'Unauthorized', headers: { [TOKEN_EXPIRADO_HEADER]: 'true' } }
    );
    backend.expectOne('/api/posts/getPostById').flush({ status: 200, errors: [], data: { post: {} } });

    expect(security.refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('el reintento tras renovar también entrega el cuerpo estándar de un error', () => {
    security.refreshAccessToken.and.returnValue(of('nuevo'));
    let body: any;
    http.get('/api/protegido').subscribe((r) => (body = r));

    backend.expectOne('/api/protegido').flush(null, { status: 423, statusText: 'Locked' });
    backend.expectOne('/api/protegido').flush({ status: 400, errors: ['Dato inválido'], data: null }, { status: 400, statusText: 'Bad Request' });

    expect(body.errors).toEqual(['Dato inválido']);
    expect(security.logout).not.toHaveBeenCalled();
  });

  it('si la renovación falla avisa que la sesión expiró y cierra la sesión', () => {
    security.refreshAccessToken.and.returnValue(throwError(() => new Error('refresh inválido')));
    let error: any;
    http.get('/api/protegido').subscribe({ error: (e) => (error = e) });

    backend.expectOne('/api/protegido').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(notifications.warning).toHaveBeenCalled();
    expect(security.logout).toHaveBeenCalled();
    expect(error).toBeTruthy();
  });

  it('sin sesión un 401 no intenta renovar', () => {
    security.getCurrentUser.and.returnValue({ usuario: {}, token: '' } as any);
    http.get('/api/protegido').subscribe({ error: () => undefined });

    backend.expectOne('/api/protegido').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(security.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('un 401 de la propia renovación nunca dispara otra renovación', () => {
    let body: any;
    http.post('/api/usuarios/refreshToken', {}).subscribe((r) => (body = r));

    backend.expectOne('/api/usuarios/refreshToken').flush({ status: 401, errors: ['Sesión inválida'], data: null }, { status: 401, statusText: 'Unauthorized' });

    expect(security.refreshAccessToken).not.toHaveBeenCalled();
    expect(body.status).toBe(401);
  });
});

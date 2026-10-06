import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HelperService } from '../shared/helper.service';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { HttpSecurityService } from './httpSecurity.service';

const CLAVE = 'taringas';

describe('HttpSecurityService (sesión)', () => {
  let service: HttpSecurityService;
  let backend: HttpTestingController;

  function guardar(usuario: object): void {
    localStorage.setItem(CLAVE, JSON.stringify(usuario));
  }

  beforeEach(() => {
    localStorage.removeItem(CLAVE);
    guardar({ usuario: { userName: 'ana' }, token: 't1', refreshToken: 'r1' });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpSecurityService,
        { provide: HelperService, useValue: { errorHandler: () => undefined } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) },
        { provide: PaginationService, useValue: {} },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['error', 'success']) },
      ],
    });

    service = TestBed.inject(HttpSecurityService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    localStorage.removeItem(CLAVE);
  });

  it('guarda el token y el refresh token rotados', () => {
    let token: string | undefined;
    service.refreshAccessToken().subscribe((t) => (token = t));

    const req = backend.expectOne((r) => r.url.endsWith('/api/usuarios/refreshToken'));
    expect(req.request.body).toEqual({ refreshToken: 'r1' });
    req.flush({ status: 200, errors: [], data: { token: 't2', refreshToken: 'r2' } });

    expect(token).toBe('t2');
    expect(service.getCurrentUser().refreshToken).toBe('r2');
    expect(JSON.parse(localStorage.getItem(CLAVE)!).token).toBe('t2');
  });

  it('varias renovaciones simultáneas hacen una sola petición (el refresh token solo sirve una vez)', () => {
    const tokens: string[] = [];
    service.refreshAccessToken().subscribe((t) => tokens.push(t));
    service.refreshAccessToken().subscribe((t) => tokens.push(t));
    service.refreshAccessToken().subscribe((t) => tokens.push(t));

    backend.expectOne((r) => r.url.endsWith('/api/usuarios/refreshToken')).flush({ status: 200, errors: [], data: { token: 't2', refreshToken: 'r2' } });

    expect(tokens).toEqual(['t2', 't2', 't2']);
  });

  it('si otra pestaña ya renovó (este refresh token quedó rotado) usa el token que ella guardó', () => {
    let token: string | undefined;
    let error: unknown;
    service.refreshAccessToken().subscribe({ next: (t) => (token = t), error: (e) => (error = e) });

    // Mientras tanto la otra pestaña renovó y guardó su resultado.
    guardar({ usuario: { userName: 'ana' }, token: 't-otra', refreshToken: 'r-otra' });
    backend.expectOne((r) => r.url.endsWith('/api/usuarios/refreshToken')).flush(
      { status: 401, errors: ['Sesión inválida o expirada'], data: null }
    );

    expect(error).toBeUndefined();
    expect(token).toBe('t-otra');
    expect(service.getCurrentUser().token).toBe('t-otra');
  });

  it('si la renovación falla y nadie más renovó, propaga el error', () => {
    let error: unknown;
    service.refreshAccessToken().subscribe({ error: (e) => (error = e) });

    backend.expectOne((r) => r.url.endsWith('/api/usuarios/refreshToken')).flush({ status: 401, errors: ['Sesión inválida'], data: null });

    expect(error).toBeTruthy();
  });

  it('se sincroniza cuando otra pestaña cambia la sesión', () => {
    guardar({ usuario: { userName: 'ana' }, token: 't9', refreshToken: 'r9' });
    window.dispatchEvent(new StorageEvent('storage', { key: CLAVE }));

    expect(service.getCurrentUser().token).toBe('t9');
  });

  it('sin refresh token falla sin llamar al API', () => {
    guardar({ usuario: {}, token: 't1' });
    window.dispatchEvent(new StorageEvent('storage', { key: CLAVE }));

    let error: unknown;
    service.refreshAccessToken().subscribe({ error: (e) => (error = e) });

    expect(error).toBeTruthy();
    backend.expectNone((r) => r.url.endsWith('/api/usuarios/refreshToken'));
  });
});

import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClientErrorHandler } from './client-error-handler';

describe('ClientErrorHandler', () => {
  let handler: ClientErrorHandler;
  let backend: HttpTestingController;
  const esLog = (r: { url: string }) => r.url.endsWith('/api/appLogs/cliente');

  beforeEach(() => {
    spyOn(console, 'error');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ClientErrorHandler],
    });
    handler = TestBed.inject(ClientErrorHandler);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('envía un error de JavaScript con su tipo, mensaje, traza y ruta', () => {
    handler.handleError(new TypeError("Cannot read properties of undefined (reading 'id')"));

    const req = backend.expectOne(esLog);
    expect(req.request.body.tipo).toBe('TypeError');
    expect(req.request.body.mensaje).toContain('reading');
    expect(req.request.body.ruta).toBe(window.location.pathname + window.location.search);
    req.flush({ status: 200, errors: [], data: true });
  });

  it('no repite el mismo error dentro de un minuto (p. ej. un error dentro de un *ngFor)', () => {
    for (let i = 0; i < 5; i++) handler.handleError(new Error('mismo error'));

    backend.expectOne(esLog).flush({});
  });

  it('no envía más de 20 errores por sesión', () => {
    for (let i = 0; i < 30; i++) handler.handleError(new Error(`error ${i}`));

    expect(backend.match(esLog).length).toBe(20);
  });

  it('ignora errores HTTP con respuesta del API (ya quedan registrados en el servidor)', () => {
    handler.handleError(new HttpErrorResponse({ status: 500, url: '/api/x' }));

    backend.expectNone(esLog);
  });

  it('registra como advertencia la falta de conexión con el API', () => {
    handler.handleError(new HttpErrorResponse({ status: 0, url: '/api/x' }));

    const req = backend.expectOne(esLog);
    expect(req.request.body.nivel).toBe('Warning');
    req.flush({});
  });

  it('si el envío falla no genera otro error', () => {
    handler.handleError(new Error('algo'));

    expect(() => backend.expectOne(esLog).flush(null, { status: 500, statusText: 'Error' })).not.toThrow();
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { ServerApiInterceptor } from './server-api.interceptor';

describe('ServerApiInterceptor (SSR)', () => {
  const proceso = globalThis as unknown as { process?: { env: Record<string, string | undefined> } };
  let original: typeof proceso.process;
  const crear = () => TestBed.runInInjectionContext(() => new ServerApiInterceptor());

  beforeEach(() => {
    original = proceso.process;
    proceso.process = { env: { API_INTERNAL_URL: 'http://api-interna:5000/' } };
  });

  afterEach(() => {
    proceso.process = original;
  });

  it('manda /api e /images al API interno', () => {
    const i = crear();
    expect(i.reescribir('/api/posts/getPosts?page=1')).toBe('http://api-interna:5000/api/posts/getPosts?page=1');
    expect(i.reescribir(`${environment.publicUrl}/api/tops/getTopPosts`)).toBe('http://api-interna:5000/api/tops/getTopPosts');
    expect(i.reescribir('/images/fotos/a.jpg')).toBe('http://api-interna:5000/images/fotos/a.jpg');
  });

  it('no toca otras URLs', () => {
    const i = crear();
    expect(i.reescribir('https://i.imgur.com/x.png')).toBe('https://i.imgur.com/x.png');
    expect(i.reescribir('/assets/i18n/es.json')).toBe('/assets/i18n/es.json');
  });

  it('sin API_INTERNAL_URL deja las URLs como están', () => {
    proceso.process = { env: {} };
    expect(crear().reescribir('/api/x')).toBe('/api/x');
  });

  it('distingue "no existe" (JSON del API) de un fallo de infraestructura', () => {
    const fallo = ServerApiInterceptor.esFalloDeInfraestructura;
    // 400 del API con su JSON: el recurso no existe -> la página puede ser 404
    expect(fallo(new HttpErrorResponse({ status: 400, error: { status: 400, errors: ['No existe'], data: null } }))).toBeFalse();
    // 400 "Invalid Hostname" de AllowedHosts (HTML), API caído, 5xx -> 503, nunca 404
    expect(fallo(new HttpErrorResponse({ status: 400, error: '<h2>Bad Request - Invalid Hostname</h2>' }))).toBeTrue();
    expect(fallo(new HttpErrorResponse({ status: 0, error: null }))).toBeTrue();
    expect(fallo(new HttpErrorResponse({ status: 502, error: { status: 502 } }))).toBeTrue();
  });
});

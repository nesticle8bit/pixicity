import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { ScriptsGlobalesService } from './scripts-globales.service';

describe('ScriptsGlobalesService', () => {
  let backend: HttpTestingController;

  // Como el de AdSense, pero en un dominio que no existe: la prueba no debe bajar nada de verdad.
  const ADSENSE = '<script async src="https://ejemplo.invalid/pagead/js/adsbygoogle.js?client=ca-pub-1" crossorigin="anonymous"></script>';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    document.querySelectorAll('[data-script-global]').forEach((n) => n.remove());
    backend.verify();
  });

  function responder(headerScript: string, footerScript = ''): void {
    backend.expectOne(`${environment.api}/api/configuracion/scripts`).flush({ status: 200, errors: [], data: { headerScript, footerScript } });
  }

  it('recrea cada <script> con sus atributos (uno de innerHTML no se ejecutaría) y agrega el resto tal cual', () => {
    TestBed.inject(ScriptsGlobalesService).insertar();
    responder('<meta name="google-adsense-account" content="ca-pub-1">', ADSENSE);

    const script = document.body.querySelector<HTMLScriptElement>('script[data-script-global="footer"]')!;
    expect(script.src).toContain('adsbygoogle.js?client=ca-pub-1');
    expect(script.async).toBeTrue();
    expect(script.getAttribute('crossorigin')).toBe('anonymous');
    expect(document.head.querySelector('meta[name="google-adsense-account"][data-script-global="header"]')).not.toBeNull();
  });

  it('no los repite si ya vinieron en el HTML del servidor', () => {
    const delServidor = document.createElement('script');
    delServidor.setAttribute('data-script-global', 'footer');
    document.body.appendChild(delServidor);

    TestBed.inject(ScriptsGlobalesService).insertar();
    responder('', ADSENSE);

    expect(document.querySelectorAll('[data-script-global="footer"]').length).toBe(1);
  });
});

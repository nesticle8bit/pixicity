import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { PresenciaService } from './presencia.service';

describe('PresenciaService', () => {
  let pings: number;
  let eventos: Subject<unknown>;

  beforeEach(() => {
    // El navegador headless a veces reporta la página como oculta: el servicio no avisaría.
    spyOnProperty(document, 'visibilityState', 'get').and.returnValue('visible');
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-11-03T12:00:00Z'));
    pings = 0;
    eventos = new Subject();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { events: eventos } },
        {
          provide: IHttpSecurityService,
          useValue: {
            getCurrentUser: () => ({ usuario: { userName: 'ana' } }),
            getCurrentUserAsObservable: () => new BehaviorSubject({ usuario: { userName: 'ana' } }),
            sessionOnlineUser: () => (pings++, of(1)),
          },
        },
      ],
    });
  });

  afterEach(() => jasmine.clock().uninstall());

  it('avisa al arrancar, cada 2 minutos y al navegar (como mucho una vez por minuto)', () => {
    TestBed.inject(PresenciaService).iniciar();
    expect(pings).toBe(1); // al arrancar con sesión

    eventos.next(new NavigationEnd(1, '/a', '/a'));
    expect(pings).toBe(1); // recién avisó: no repite

    jasmine.clock().tick(61_000);
    eventos.next(new NavigationEnd(2, '/b', '/b'));
    expect(pings).toBe(2); // pasó el minuto: la navegación avisa

    jasmine.clock().tick(2 * 60_000);
    expect(pings).toBeGreaterThanOrEqual(3); // el intervalo de 2 minutos
  });

  it('no se inicia dos veces', () => {
    const s = TestBed.inject(PresenciaService);
    s.iniciar();
    s.iniciar();
    expect(pings).toBe(1);
  });
});

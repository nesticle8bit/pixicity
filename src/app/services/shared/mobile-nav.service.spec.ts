import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { MobileNavService } from './mobile-nav.service';
import { IHttpLogsService } from '../interfaces/httpLogs.interface';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { MensajesBadgeService } from './mensajes-badge.service';
import { SignalrService } from './signalr.service';

describe('MobileNavService', () => {
  let service: MobileNavService;
  let logs: jasmine.SpyObj<IHttpLogsService>;
  let security: jasmine.SpyObj<IHttpSecurityService>;
  let signalr: { notification$: Subject<any>; mensaje$: Subject<any>; mensajesLeidos$: Subject<any> };

  const setViewport = (mobile: boolean) =>
    spyOn(window, 'matchMedia').and.returnValue({ matches: mobile } as MediaQueryList);

  beforeEach(() => {
    logs = jasmine.createSpyObj('IHttpLogsService', ['getStats']);
    security = jasmine.createSpyObj('IHttpSecurityService', ['getCurrentUser']);
    logs.getStats.and.returnValue(of({ notifications: 3, messages: 2 }));
    security.getCurrentUser.and.returnValue({ usuario: { userName: 'yo' }, token: 't' } as any);
    signalr = { notification$: new Subject(), mensaje$: new Subject(), mensajesLeidos$: new Subject() };

    TestBed.configureTestingModule({
      providers: [
        { provide: IHttpLogsService, useValue: logs },
        { provide: IHttpSecurityService, useValue: security },
        { provide: SignalrService, useValue: signalr },
        { provide: Router, useValue: { events: new Subject() } },
        MensajesBadgeService,
      ],
    });
    service = TestBed.inject(MobileNavService);
  });

  it('abre, cierra y alterna', () => {
    setViewport(true);

    service.toggle();
    expect(service.isOpen()).toBeTrue();

    service.toggle();
    expect(service.isOpen()).toBeFalse();

    service.open();
    service.close();
    expect(service.isOpen()).toBeFalse();
  });

  it('en móvil con sesión carga los contadores', () => {
    setViewport(true);

    service.watchStats();

    expect(service.stats()).toEqual({ notifications: 3, messages: 2 });
  });

  it('en escritorio no consulta (ya lo hace el menú del header)', () => {
    setViewport(false);

    service.watchStats();

    expect(logs.getStats).not.toHaveBeenCalled();
  });

  it('sin sesión no consulta', () => {
    setViewport(true);
    security.getCurrentUser.and.returnValue({ usuario: undefined, token: '' } as any);

    service.watchStats();

    expect(logs.getStats).not.toHaveBeenCalled();
  });

  it('una notificación en vivo suma al contador', () => {
    setViewport(true);
    service.watchStats();

    signalr.notification$.next({});

    expect(service.stats().notifications).toBe(4);
  });

  it('watchStats es idempotente', () => {
    setViewport(true);

    service.watchStats();
    service.watchStats();

    expect(logs.getStats).toHaveBeenCalledTimes(1);
  });
});

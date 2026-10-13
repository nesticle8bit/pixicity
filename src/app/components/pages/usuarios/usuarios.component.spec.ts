import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpRangosService } from 'src/app/services/interfaces/httpRangos.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { UsuariosComponent } from './usuarios.component';

describe('UsuariosComponent', () => {
  let getUsuarios: jasmine.Spy;
  let navigate: jasmine.Spy;
  let query$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  function crear(params: Record<string, string> = {}): UsuariosComponent {
    getUsuarios = jasmine.createSpy('getUsuarios').and.returnValue(of({ usuarios: [], pagination: { totalCount: 0 } }));
    navigate = jasmine.createSpy('navigate');
    query$ = new BehaviorSubject(convertToParamMap(params));
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: query$ } },
        { provide: Router, useValue: { navigate } },
        { provide: IHttpSecurityService, useValue: { getUsuarios } },
        { provide: IHttpParametrosService, useValue: { getPaisesDropdown: () => of([]) } },
        { provide: IHttpRangosService, useValue: { getRangosDropdown: () => of([]) } },
        { provide: DisplayComponentService, useValue: { setDisplay: () => {} } },
        { provide: SEOService, useValue: { setSEO: () => {} } },
      ],
    });
    const c = TestBed.runInInjectionContext(() => new UsuariosComponent());
    c.ngOnInit();
    return c;
  }

  it('lee los filtros de la URL y los manda al API (antes "en línea" nunca se enviaba)', () => {
    crear({ q: 'ana', enLinea: '1', orden: 'puntos', rango: '3', page: '2' });

    expect(getUsuarios).toHaveBeenCalledWith(
      jasmine.objectContaining({ query: 'ana', enLinea: true, orden: 'puntos', rango: 3, page: 2, pageCount: 24 })
    );
  });

  it('un orden desconocido en la URL cae a "recientes"', () => {
    crear({ orden: 'hackeado' });

    expect(getUsuarios.calls.mostRecent().args[0].orden).toBe('recientes');
  });

  it('cambiar un filtro lo escribe en la URL y vuelve a la página 1', fakeAsync(() => {
    const c = crear({ page: '4' });

    c.formGroup.patchValue({ enLinea: true });
    tick(300);

    const queryParams = navigate.calls.mostRecent().args[1].queryParams;
    expect(queryParams.enLinea).toBe(1);
    expect(queryParams.page).toBeNull();
  }));

  it('texto de última actividad', () => {
    const c = crear();

    expect(c.ultimaVez(null)).toBe('Sin actividad reciente');
    expect(c.ultimaVez(5)).toBe('Activo hace 5 min');
    expect(c.ultimaVez(180)).toBe('Activo hace 3 h');
    expect(c.ultimaVez(60 * 24)).toBe('Activo hace 1 día');
  });
});

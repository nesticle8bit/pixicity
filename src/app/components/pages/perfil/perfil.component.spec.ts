import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PERFIL_VACIO, PerfilUsuarioViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpBloqueosService } from 'src/app/services/interfaces/httpBloqueos.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { MatDialog } from '@angular/material/dialog';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { PerfilComponent } from './perfil.component';

describe('PerfilComponent', () => {
  let setSEO: jasmine.Spy;
  let getBloqueo: jasmine.Spy;
  let navigate: jasmine.Spy;
  let setDisplay: jasmine.Spy;
  let cambiarFondo: jasmine.Spy;

  const perfil: PerfilUsuarioViewModel = { ...PERFIL_VACIO, id: 7, userName: 'juan', postsCount: 12, seguidoresCount: 30 };

  function crear(sesion: string | null, respuesta = of(perfil), tab: string | null = null): PerfilComponent {
    setSEO = jasmine.createSpy('setSEO');
    navigate = jasmine.createSpy('navigate');
    getBloqueo = jasmine.createSpy('getBloqueoContraPerfil').and.returnValue(of(null));
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ userName: 'juan' })), queryParamMap: of(convertToParamMap(tab ? { tab } : {})) },
        },
        { provide: Router, useValue: { navigate } },
        {
          provide: IHttpSecurityService,
          useValue: {
            getCurrentUser: () => ({ usuario: sesion ? { userName: sesion } : undefined, token: '' }),
            getUserByUserName: () => respuesta,
          },
        },
        { provide: IHttpBloqueosService, useValue: { getBloqueoContraPerfil: getBloqueo } },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['success']) },
        { provide: DisplayComponentService, useValue: { setDisplay: (setDisplay = jasmine.createSpy('setDisplay')) } },
        { provide: SEOService, useValue: { setSEO } },
        { provide: IHttpUsuarioPerfilService, useValue: { changeBackgroundProfile: (cambiarFondo = jasmine.createSpy('changeBackgroundProfile').and.returnValue(of(true))) } },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
      ],
    });
    return TestBed.runInInjectionContext(() => new PerfilComponent());
  }

  it('solo el dueño puede editar avatar y portada', () => {
    expect(crear('juan').esMio).toBeTrue();
    TestBed.resetTestingModule();
    expect(crear('pedro').esMio).toBeFalse();
    TestBed.resetTestingModule();
    expect(crear(null).esMio).toBeFalse();
  });

  it('la portada valida la URL y al guardar conserva el fondo de página', () => {
    const c = crear('juan', of({ ...perfil, profilePageBackground: 'https://x.com/patron.gif', profilePageBackgroundRepeat: 'repeat-x' }));
    c.editarBanner();
    c.bannerUrl.set('https://x.com/foto.gif');
    expect(c.bannerInvalida()).toBeTrue();
    c.guardarBanner();
    expect(cambiarFondo).not.toHaveBeenCalled();

    c.bannerUrl.set('https://x.com/portada.jpg');
    c.posBanner.set({ x: 20, y: 80 });
    c.guardarBanner();
    expect(cambiarFondo).toHaveBeenCalledWith({
      profileBackground: 'https://x.com/portada.jpg',
      profileBackgroundPosX: 20,
      profileBackgroundPosY: 80,
      profilePageBackground: 'https://x.com/patron.gif',
      profilePageBackgroundRepeat: 'repeat-x',
    });
    expect(c.currentUser.profileBackground).toBe('https://x.com/portada.jpg');
    expect(c.editandoBanner()).toBeFalse();
  });

  it('publica en el JSON-LD los seguidores y posts reales (antes leía campos inexistentes y mandaba 0)', () => {
    crear(null);

    const persona = setSEO.calls.mostRecent().args[0].jsonLd.mainEntity;
    expect(persona.interactionStatistic.map((s: { userInteractionCount: number }) => s.userInteractionCount)).toEqual([30, 12]);
  });

  it('perfil inexistente: 404 y noindex', () => {
    crear(null, throwError(() => new Error('400')));

    expect(setSEO).toHaveBeenCalledWith(jasmine.objectContaining({ statusCode: 404, noIndex: true }));
  });

  it('pide el estado de bloqueo solo con sesión y en un perfil ajeno', () => {
    crear(null);
    expect(getBloqueo).not.toHaveBeenCalled();

    TestBed.resetTestingModule();
    crear('juan');
    expect(getBloqueo).not.toHaveBeenCalled();

    TestBed.resetTestingModule();
    crear('otra');
    expect(getBloqueo).toHaveBeenCalledOnceWith('juan');
  });

  it('la pestaña sale de ?tab= (así contadores y pestañas siempre coinciden); una desconocida cae al muro', () => {
    expect(crear(null, of(perfil), 'posts').currentSelection).toBe('posts');

    TestBed.resetTestingModule();
    expect(crear(null, of(perfil), 'medallas').currentSelection).toBe('shouts');
  });

  it('cambiar de pestaña la guarda en la URL y descarta la página de posts', () => {
    const c = crear(null);

    c.seleccionar('followers');
    expect(navigate.calls.mostRecent().args[1].queryParams).toEqual({ tab: 'followers', page: null });

    c.seleccionar('shouts');
    expect(navigate.calls.mostRecent().args[1].queryParams).toEqual({ tab: null, page: null });
  });

  it('fondo de página: arma el url() sin caracteres que lo puedan cerrar y descarta lo que no es http(s)', () => {
    const c = crear(null, of({ ...perfil, profilePageBackground: 'https://x/patron.png")+red', profilePageBackgroundRepeat: 'repeat-x' }));
    expect(c.fondoPaginaCss).toBe('url("https://x/patron.png+red")');

    TestBed.resetTestingModule();
    expect(crear(null, of({ ...perfil, profilePageBackground: 'javascript:alert(1)' })).fondoPaginaCss).toBeNull();

    TestBed.resetTestingModule();
    expect(crear(null, of({ ...perfil, profilePageBackground: null })).fondoPaginaCss).toBeNull();
  });

  it('publica el fondo de página para toda la página (incluida la barra de noticias) y lo quita al salir', () => {
    crear(null, of({ ...perfil, profilePageBackground: 'https://x/patron.png', profilePageBackgroundRepeat: 'repeat-y' }));

    expect(setDisplay.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ background: 'https://x/patron.png', backgroundRepeat: 'repeat-y' }));

    // Al destruir el perfil (navegar a otra página) el fondo no debe quedar puesto.
    TestBed.resetTestingModule();
    expect(setDisplay.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ background: '' }));
  });

  it('perfil inexistente: muestra el aviso en vez de la cabecera vacía', () => {
    const c = crear(null, throwError(() => new Error('400')));

    expect(c.noEncontrado).toBeTrue();
    expect(c.cargando).toBeFalse();
  });
});

import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ShoutReaccion } from 'src/app/models/perfil/shout-vm.model';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { ShoutsViewComponent } from './shouts-view.component';

describe('ShoutsViewComponent: me gusta y favoritos', () => {
  let perfil: jasmine.SpyObj<IHttpPerfilService>;
  let avisos: jasmine.SpyObj<NotificationService>;

  function crear(sesion: boolean): ShoutsViewComponent {
    perfil = jasmine.createSpyObj('IHttpPerfilService', [
      'getShoutById',
      'getShoutInteracciones',
      'alternarMeGustaShout',
      'alternarFavoritoShout',
    ]);
    perfil.getShoutById.and.returnValue(of({ id: 5, comentario: 'hola', avatar: { userName: 'ana' } } as any));
    perfil.getShoutInteracciones.and.returnValue(of({ meGustas: 3, favoritos: 1, meGusta: false, favorito: true }));
    avisos = jasmine.createSpyObj('NotificationService', ['warning', 'success', 'confirm']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '5' })) } },
        { provide: IHttpPerfilService, useValue: perfil },
        {
          provide: IHttpSecurityService,
          useValue: { getCurrentUser: () => ({ usuario: sesion ? { userName: 'yo' } : undefined, token: '' }) },
        },
        { provide: NotificationService, useValue: avisos },
        { provide: DisplayComponentService, useValue: { setDisplay: () => {} } },
        { provide: SEOService, useValue: { setSEO: () => {} } },
        { provide: MatSnackBar, useValue: { open: () => {} } },
      ],
    });
    const c = TestBed.runInInjectionContext(() => new ShoutsViewComponent());
    c.ngOnInit();
    return c;
  }

  it('carga los contadores y lo que marcó el usuario', () => {
    const c = crear(true);
    expect(perfil.getShoutInteracciones).toHaveBeenCalledOnceWith(5);
    expect(c.interacciones()).toEqual({ meGustas: 3, favoritos: 1, meGusta: false, favorito: true });
  });

  it('me gusta: cambia al instante y toma el total del API', () => {
    const c = crear(true);
    const respuesta = new Subject<ShoutReaccion>();
    perfil.alternarMeGustaShout.and.returnValue(respuesta);

    c.alternarMeGusta();
    expect(c.interacciones()).toEqual(jasmine.objectContaining({ meGusta: true, meGustas: 4 }));

    c.alternarMeGusta(); // mientras espera, no manda otro pedido
    expect(perfil.alternarMeGustaShout).toHaveBeenCalledTimes(1);

    respuesta.next({ total: 7, activo: true });
    expect(c.interacciones()).toEqual(jasmine.objectContaining({ meGusta: true, meGustas: 7 }));
    expect(c.enviando()).toBeNull();
  });

  it('favorito: si el API falla vuelve al estado anterior', () => {
    const c = crear(true);
    perfil.alternarFavoritoShout.and.returnValue(throwError(() => new Error('500')));

    c.alternarFavorito();

    expect(c.interacciones()).toEqual({ meGustas: 3, favoritos: 1, meGusta: false, favorito: true });
  });

  it('sin sesión avisa y no llama al API', () => {
    const c = crear(false);

    c.alternarMeGusta();
    c.alternarFavorito();

    expect(avisos.warning).toHaveBeenCalledTimes(2);
    expect(perfil.alternarMeGustaShout).not.toHaveBeenCalled();
    expect(perfil.alternarFavoritoShout).not.toHaveBeenCalled();
  });
});

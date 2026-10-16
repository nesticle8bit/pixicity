import { IHttpSilenciosService } from 'src/app/services/interfaces/httpSilencios.interface';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { ShoutCardComponent } from './shout-card.component';

describe('ShoutCardComponent', () => {
  let perfil: jasmine.SpyObj<IHttpPerfilService>;
  let fixture: ComponentFixture<ShoutCardComponent>;

  const shout = (autor: string): ShoutViewModel => ({
    id: 3, perfilId: 1, usuarioId: 1, comentario: 'hola', url: '', tipo: 'Texto', mediaTitulo: null, mediaImagen: null,
    mediaDescripcion: null, fechaRegistro: '2026-10-01T12:00:00Z', avatar: { userName: autor, avatar: null },
    perfil: { userName: 'muro', avatar: null },
    interacciones: { meGustas: 2, favoritos: 0, meGusta: false, favorito: false, comentarios: 5, reshouts: 1, reshouteado: false },
  });

  function crear(autor: string, sesion: string | null = 'yo'): HTMLElement {
    perfil = jasmine.createSpyObj('IHttpPerfilService', ['alternarMeGustaShout', 'alternarFavoritoShout', 'alternarReshoutShout']);
    TestBed.configureTestingModule({
      imports: [ShoutCardComponent],
      providers: [
        provideRouter([]),
        { provide: IHttpPerfilService, useValue: perfil },
        { provide: IHttpSecurityService, useValue: { getCurrentUser: () => ({ usuario: sesion ? { userName: sesion } : undefined, token: sesion ? 't' : '' }) } },
        // Lo usa el popover de usuario de los enlaces @nombre (no se abre en estos tests).
        { provide: IHttpUsuarioPerfilService, useValue: {} },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['warning', 'info', 'success', 'error']) },
        { provide: IHttpSilenciosService, useValue: jasmine.createSpyObj('IHttpSilenciosService', ['alternarUsuario']) },
      ],
    });
    fixture = TestBed.createComponent(ShoutCardComponent);
    fixture.componentRef.setInput('shout', shout(autor));
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  const boton = (el: HTMLElement, nombre: RegExp) =>
    [...el.querySelectorAll('button')].find((b) => nombre.test(b.getAttribute('aria-label') ?? ''))!;

  it('muestra los contadores, el muro ajeno y enlaza a comentar', () => {
    const el = crear('ana');
    expect(boton(el, /^Me gusta \(2\)/)).toBeTruthy();
    expect(boton(el, /^Compartir \(1\)/)).toBeTruthy();
    expect(el.querySelector('a[aria-label^="Comentar (5"]')?.getAttribute('href')).toBe('/shouts/ana/3');
    expect(el.textContent).toContain('@muro');
  });

  it('el propio shout no se puede compartir', () => {
    const el = crear('yo');
    expect(boton(el, /^Compartir/).disabled).toBeTrue();
  });

  it('me gusta: cambia al instante y vuelve atrás si el API falla', () => {
    const el = crear('ana');
    perfil.alternarMeGustaShout.and.returnValue(throwError(() => new Error('500')));

    boton(el, /^Me gusta/).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.interacciones()).toEqual(jasmine.objectContaining({ meGusta: false, meGustas: 2 }));
  });

  it('compartir: toma el total del API', () => {
    const el = crear('ana');
    perfil.alternarReshoutShout.and.returnValue(of({ total: 4, activo: true }));

    boton(el, /^Compartir/).click();
    fixture.detectChanges();

    expect(boton(el, /^Compartir \(4\)/).getAttribute('aria-pressed')).toBe('true');
  });
});

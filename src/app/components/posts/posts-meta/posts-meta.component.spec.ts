import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { PostsMetaComponent } from './posts-meta.component';

// Igual que posts-view: el componente se crea con el post ya cargado (dentro de @if), así que el setter de
// `post` corre antes de ngOnInit.
@Component({
  template: `@if (post) { <app-posts-meta [post]="post"></app-posts-meta> }`,
  imports: [PostsMetaComponent],
})
class HostComponent {
  post: any = { id: 10, puntos: 3, fechaRegistro: '2026-01-12T14:02:00Z', categoria: { seo: 'design', nombre: 'Design y Variados' }, seguidores: 2, favoritos: 1, visitantes: 50, cantidadComentarios: 12, seguirPost: false, usuario: { userName: 'autor' } };
}

describe('PostsMetaComponent', () => {
  const posts = {
    getAvailableVotos: jasmine.createSpy('getAvailableVotos'),
    setVotos: jasmine.createSpy('setVotos'),
    seguirPost: jasmine.createSpy('seguirPost'),
    alternarFavoritoPost: jasmine.createSpy('alternarFavoritoPost'),
    getInteraccionesPost: jasmine.createSpy('getInteraccionesPost'),
  };
  /** Respuesta de getInteraccionesPost; cada test la ajusta antes de crear. */
  let interacciones: any;
  let usuario: unknown;
  let enVivo: Subject<any>;
  let signalr: any;
  let dialogo: any;

  const crear = async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideRouter([]),
        { provide: IHttpPostsService, useValue: posts },
        { provide: IHttpSecurityService, useValue: { getCurrentUser: () => usuario } },
        { provide: MatDialog, useValue: dialogo },
        { provide: SignalrService, useValue: signalr },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['info']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  };

  const boton = (el: HTMLElement, texto: RegExp) =>
    [...el.querySelectorAll('button')].find((b) => texto.test(b.textContent ?? '')) as HTMLButtonElement;

  beforeEach(() => {
    Object.values(posts).forEach((s) => s.calls.reset());
    posts.getAvailableVotos.and.returnValue(of(25));
    posts.setVotos.and.returnValue(of(true));
    posts.seguirPost.and.returnValue(of(true));
    let enFav = false;
    posts.alternarFavoritoPost.and.callFake(() => {
      enFav = !enFav;
      return of({ activo: enFav, total: enFav ? 2 : 1 });
    });
    enVivo = new Subject();
    signalr = { postVotado$: enVivo, startPost: jasmine.createSpy('startPost'), stopPost: jasmine.createSpy('stopPost') };
    dialogo = { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) }) };
    interacciones = {
      misPuntos: 0,
      enFavoritos: false,
      yoRecomende: false,
      puntosDisponibles: 25,
      puntosHoy: 10,
      votantes: [{ userName: 'ana', avatar: null, cantidad: 7, fecha: '2026-10-01T00:00:00Z' }],
      totalVotantes: 4,
      recomendaron: [{ userName: 'beto', avatar: null, cantidad: 0, fecha: '2026-10-01T00:00:00Z' }],
      totalRecomendaciones: 1,
    };
    posts.getInteraccionesPost.and.callFake(() => of(interacciones));
  });

  it('con sesión muestra hasta 10 opciones de puntos aunque el post llegue antes de ngOnInit', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    const fixture = await crear();

    // Los puntos del día llegan con las interacciones: un solo pedido.
    expect(posts.getAvailableVotos).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.barpuntos button').length).toBe(10);
    expect(fixture.nativeElement.textContent).toContain('Te quedan 25 puntos hoy');
  });

  it('dar puntos suma al total y reemplaza la barra por el agradecimiento', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;

    (el.querySelector('[aria-label="Dar 5 puntos"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(posts.setVotos).toHaveBeenCalledWith({ typeId: 10, cantidad: 5, votosType: 1 });
    expect(el.querySelector('.pm-puntos__numero')?.textContent?.trim()).toBe('8');
    expect(el.querySelector('.barpuntos')).toBeNull();
    expect(el.textContent).toContain('¡Le diste 5 puntos!');
  });

  it('seguir y favoritos cambian el estado y los contadores', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;

    boton(el, /Seguir post/).click();
    boton(el, /Agregar a favoritos/).click();
    fixture.detectChanges();

    expect(boton(el, /Siguiendo/).getAttribute('aria-pressed')).toBe('true');
    expect(boton(el, /Agregado a favoritos/).getAttribute('aria-pressed')).toBe('true');
    const stats = [...el.querySelectorAll('.pm-stat dd')].map((d) => d.textContent?.trim());
    expect(stats).toEqual(['3', '12', '50', '2']); // seguidores, comentarios, visitas, favoritos (los puntos ya van en la caja grande)
    expect(el.querySelector('.pm-datos')?.textContent).toContain('Design y Variados');

    // Un segundo clic lo quita de favoritos.
    boton(el, /Agregado a favoritos/).click();
    fixture.detectChanges();
    expect(boton(el, /Agregar a favoritos/).getAttribute('aria-pressed')).toBe('false');
    expect(posts.alternarFavoritoPost).toHaveBeenCalledTimes(2);
  });

  it('si ya dio puntos no muestra la barra, sino cuántos dio', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    interacciones = { ...interacciones, misPuntos: 6, enFavoritos: true };
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('.pm-punto').length).toBe(0);
    expect(el.textContent).toContain('¡Le diste 6 puntos!');
    expect(boton(el, /Agregado a favoritos/)).toBeTruthy();
  });

  it('muestra quiénes dieron puntos y quiénes recomendaron', async () => {
    usuario = { usuario: undefined, token: '' };
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;

    const gente = [...el.querySelectorAll('.pm-gente')].map((g) => g.textContent?.replace(/\s+/g, ' ').trim());
    expect(gente[0]).toContain('Le dieron puntos (4)');
    expect(gente[0]).toContain('+7');
    expect(gente[0]).toContain('+3'); // 3 votantes más que no entran en la lista
    expect(gente[1]).toContain('Recomendado por (1)');
    expect(el.querySelector('.pm-gente--recomendado a')?.getAttribute('href')).toBe('/perfil/beto');
  });

  it('el autor no ve la barra de puntos ni las acciones sobre su propio post', async () => {
    usuario = { usuario: { userName: 'autor' }, token: 't' };
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;

    expect(posts.getAvailableVotos).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Este es tu post');
    expect(el.textContent).toContain('Hoy recibió 10 puntos');
    expect(el.querySelector('.pm-autor__editar')?.getAttribute('href')).toBe('/posts/actualizar/10');
    expect(boton(el, /Seguir post/)).toBeUndefined();
  });

  it('sin sesión no pide los puntos y las acciones llevan al login', async () => {
    usuario = { usuario: undefined, token: '' };
    const fixture = await crear();
    const navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    expect(posts.getAvailableVotos).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('para darle puntos');

    boton(fixture.nativeElement, /Seguir post/).click();
    expect(posts.seguirPost).not.toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: jasmine.any(String) } });
  });

  it('mientras llega mi estado muestra un esqueleto, no la barra (evita votar dos veces)', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    const pendiente = new Subject<any>();
    posts.getInteraccionesPost.and.returnValue(pendiente);
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.pm-esqueleto')).not.toBeNull();
    expect(el.querySelectorAll('.pm-punto').length).toBe(0);
    expect(boton(el, /Agregar a favoritos/).disabled).toBeTrue();

    pendiente.next({ ...interacciones, misPuntos: 4 });
    fixture.detectChanges();
    expect(el.querySelector('.pm-esqueleto')).toBeNull();
    expect(el.textContent).toContain('¡Le diste 4 puntos!');
  });

  it('si fallan las interacciones, igual pide los puntos disponibles', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    posts.getInteraccionesPost.and.returnValue(of(null));
    const fixture = await crear();

    expect(posts.getAvailableVotos).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.querySelectorAll('.pm-punto').length).toBe(10);
  });

  it('los puntos llegan en vivo: suma el total y al votante', async () => {
    usuario = { usuario: undefined, token: '' };
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;
    expect(signalr.startPost).toHaveBeenCalledWith(10);

    enVivo.next({ postId: 10, puntos: 13, votante: { userName: 'caro', avatar: null, cantidad: 10, fecha: '2026-10-16T00:00:00Z' } });
    enVivo.next({ postId: 99, puntos: 1, votante: { userName: 'otro', avatar: null, cantidad: 1, fecha: '' } }); // otro post
    fixture.detectChanges();

    expect(el.querySelector('.pm-puntos__numero')?.textContent?.trim()).toBe('13');
    expect(el.querySelector('.pm-gente')?.textContent).toContain('Le dieron puntos (5)');
    expect(el.querySelector('.pm-gente__usuario')?.getAttribute('href')).toBe('/perfil/caro');

    fixture.destroy();
    expect(signalr.stopPost).toHaveBeenCalledWith(10);
  });

  it('el +N abre la lista completa', async () => {
    usuario = { usuario: undefined, token: '' };
    const fixture = await crear();

    boton(fixture.nativeElement, /\+3/).click();
    expect(dialogo.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({ data: { postId: 10, tipo: 'votos' } }));
  });

  it('si ya lo recomendé muestra "Recomendado" y no abre el diálogo', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    interacciones = { ...interacciones, yoRecomende: true };
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;

    const recomendado = boton(el, /^\s*Recomendado\s*$/);
    expect(recomendado.getAttribute('aria-pressed')).toBe('true');
    recomendado.click();
    fixture.detectChanges();
    expect(dialogo.open).not.toHaveBeenCalled();
    expect(el.querySelector('.pm-aviso')?.textContent).toContain('Ya recomendaste');
  });

  it('favoritos es optimista y se revierte si el API falla', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    const respuesta = new Subject<any>();
    posts.alternarFavoritoPost.and.returnValue(respuesta);
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;

    boton(el, /Agregar a favoritos/).click();
    fixture.detectChanges();
    expect(boton(el, /Agregado a favoritos/)).toBeTruthy(); // al instante
    expect([...el.querySelectorAll('.pm-stat dd')][3].textContent?.trim()).toBe('2');

    respuesta.error(new Error('500'));
    fixture.detectChanges();
    expect(boton(el, /Agregar a favoritos/)).toBeTruthy();
    expect([...el.querySelectorAll('.pm-stat dd')][3].textContent?.trim()).toBe('1');
  });
});

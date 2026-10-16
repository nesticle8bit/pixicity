import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
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
  post: any = { id: 10, puntos: 3, fechaRegistro: '2026-01-12T14:02:00Z', categoria: { seo: 'design', nombre: 'Design y Variados' }, seguidores: 2, favoritos: 1, visitantes: 50, seguirPost: false, usuario: { userName: 'autor' } };
}

describe('PostsMetaComponent', () => {
  const posts = {
    getAvailableVotos: jasmine.createSpy('getAvailableVotos'),
    setVotos: jasmine.createSpy('setVotos'),
    seguirPost: jasmine.createSpy('seguirPost'),
    addFavoritePost: jasmine.createSpy('addFavoritePost'),
  };
  let usuario: unknown;

  const crear = async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideRouter([]),
        { provide: IHttpPostsService, useValue: posts },
        { provide: IHttpSecurityService, useValue: { getCurrentUser: () => usuario } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
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
    posts.addFavoritePost.and.returnValue(of(true));
  });

  it('con sesión muestra hasta 10 opciones de puntos aunque el post llegue antes de ngOnInit', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    const fixture = await crear();

    expect(posts.getAvailableVotos).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.querySelectorAll('.barpuntos button').length).toBe(10);
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
    expect(boton(el, /En favoritos/).disabled).toBeTrue();
    const stats = [...el.querySelectorAll('.pm-stat dd')].map((d) => d.textContent?.trim());
    expect(stats).toEqual(['3', '3', '50', '2']); // seguidores, puntos, visitas, favoritos (como el Taringa! clásico)
    expect(el.querySelector('.pm-datos')?.textContent).toContain('Design y Variados');
  });

  it('el autor no ve la barra de puntos ni las acciones sobre su propio post', async () => {
    usuario = { usuario: { userName: 'autor' }, token: 't' };
    const fixture = await crear();
    const el: HTMLElement = fixture.nativeElement;

    expect(posts.getAvailableVotos).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Este es tu post');
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
});

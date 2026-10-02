import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MainMenuComponent } from './main-menu.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NAV_LINKS, linksFor } from '../main-nav.config';

@Component({ standalone: false, template: '' })
class DummyComponent {}


describe('MainMenuComponent (pestañas)', () => {
  let fixture: ComponentFixture<MainMenuComponent>;
  let user$: BehaviorSubject<any>;
  let router: Router;

  const build = async (usuario?: any) => {
    user$ = new BehaviorSubject<any>({ usuario, token: usuario ? 't' : '' });

    await TestBed.configureTestingModule({
      declarations: [MainMenuComponent, DummyComponent],
      imports: [RouterModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'tops', component: DummyComponent },
          { path: 'comunidades', children: [{ path: 'explorar', component: DummyComponent }] },
          { path: 'administracion', children: [{ path: 'dashboard', component: DummyComponent }, { path: 'usuarios', component: DummyComponent }] },
          { path: 'login', component: DummyComponent },
        ]),
        {
          provide: IHttpSecurityService,
          useValue: { getCurrentUserAsObservable: () => user$.asObservable() },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MainMenuComponent);
    fixture.detectChanges();
  };

  const tabs = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('.main-menu--item'));
  const activos = (): string[] =>
    tabs().filter((t) => t.classList.contains('main-menu--item--active')).map((t) => t.querySelector('a')!.getAttribute('title')!);
  const ir = async (url: string) => {
    await router.navigateByUrl(url);
    fixture.detectChanges();
  };

  it('invitado: 4 pestañas + iniciar sesión + registro, todas como enlaces reales', async () => {
    await build();

    expect(tabs().length).toBe(6);
    expect(tabs().every((t) => !!t.querySelector('a[href]'))).toBeTrue();
  });

  it('usuario normal: sin login/registro ni Administración', async () => {
    await build({ userName: 'yo', rango: 'Usuario' });

    const titulos = tabs().map((t) => t.querySelector('a')!.getAttribute('title'));
    expect(titulos).toEqual(['Posts', 'TOPs', 'Comunidades', 'Fotos']);
  });

  it('administrador: agrega Administración, y reacciona al cambio de sesión sin recargar', async () => {
    await build({ userName: 'admin', rango: 'Administrador' });
    expect(tabs().map((t) => t.querySelector('a')!.getAttribute('title'))).toContain('Administración');

    user$.next({ usuario: undefined, token: '' });
    fixture.detectChanges();

    const titulos = tabs().map((t) => t.querySelector('a')!.getAttribute('title'));
    expect(titulos).not.toContain('Administración');
    expect(titulos).toContain('Iniciar sesión');
  });

  it('Posts solo está activo en la portada, no en el resto de rutas', async () => {
    await build({ userName: 'yo', rango: 'Usuario' });

    await ir('/');
    expect(activos()).toEqual(['Posts']);

    await ir('/tops');
    expect(activos()).toEqual(['TOPs']);
  });

  it('una subruta mantiene activa su sección (antes solo coincidía la raíz)', async () => {
    await build({ userName: 'yo', rango: 'Usuario' });

    await ir('/comunidades/explorar');

    expect(activos()).toEqual(['Comunidades']);
  });

  it('Administración queda activa en cualquier página del panel', async () => {
    await build({ userName: 'admin', rango: 'Administrador' });

    await ir('/administracion/usuarios');

    expect(activos()).toEqual(['Administración']);
  });

  it('la pestaña activa se marca con aria-current', async () => {
    await build({ userName: 'yo', rango: 'Usuario' });

    await ir('/tops');

    const actual = fixture.nativeElement.querySelector('[aria-current="page"]') as HTMLElement;
    expect(actual.getAttribute('title')).toBe('TOPs');
  });
});

describe('main-nav.config', () => {
  it('las pestañas son un subconjunto de los enlaces', () => {
    const tabs = linksFor('Administrador', true).map((l) => l.label);

    expect(tabs).toEqual(['Posts', 'TOPs', 'Comunidades', 'Fotos', 'Administración']);
    expect(NAV_LINKS.length).toBeGreaterThan(tabs.length);
  });

  it('Moderación solo para moderadores y Administración solo para administradores', () => {
    expect(linksFor('Moderador').map((l) => l.label)).toContain('Moderación');
    expect(linksFor('Moderador').map((l) => l.label)).not.toContain('Administración');
    expect(linksFor('Administrador').map((l) => l.label)).toContain('Administración');
    expect(linksFor(undefined).map((l) => l.label)).not.toContain('Moderación');
  });
});

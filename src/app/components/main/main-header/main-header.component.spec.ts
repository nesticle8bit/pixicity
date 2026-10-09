import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterModule } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { MainHeaderComponent } from './main-header.component';
import { MobileDrawerComponent } from '../mobile-drawer/mobile-drawer.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { MobileNavService } from 'src/app/services/shared/mobile-nav.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { SectionUserInfoLoginComponent } from '../../sections/section-user-info-login/section-user-info-login.component';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';

// Igual que app.component.html: el cajón es hermano del header, no hijo.
@Component({
    template: '<main-header></main-header><app-mobile-drawer></app-mobile-drawer>',
    imports: [MainHeaderComponent, MobileDrawerComponent],
})
class HostComponent {}

// Renderiza las plantillas reales del header y del cajón móvil (sin los componentes hijos de otros módulos).
describe('MainHeader + MobileDrawer (hamburguesa)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let user$: BehaviorSubject<any>;
  let nav: { isOpen: any; stats: any; open: jasmine.Spy; close: jasmine.Spy; toggle: jasmine.Spy; watchStats: jasmine.Spy };

  const el = (selector: string): HTMLElement | null => fixture.nativeElement.querySelector(selector);
  const header = (): MainHeaderComponent => fixture.debugElement.query(By.directive(MainHeaderComponent)).componentInstance;
  const drawer = (): MobileDrawerComponent => fixture.debugElement.query(By.directive(MobileDrawerComponent)).componentInstance;
  const touch = (x: number, y: number) => ({ touches: [{ clientX: x, clientY: y }] }) as any;

  const build = async (usuario: any) => {
    user$ = new BehaviorSubject<any>({ usuario, token: usuario ? 't' : '' });
    const isOpen = signal(false);

    nav = {
      isOpen,
      stats: signal({ notifications: 0, messages: 0 }),
      open: jasmine.createSpy('open').and.callFake(() => isOpen.set(true)),
      close: jasmine.createSpy('close').and.callFake(() => isOpen.set(false)),
      toggle: jasmine.createSpy('toggle').and.callFake(() => isOpen.set(!isOpen())),
      watchStats: jasmine.createSpy('watchStats'),
    };

    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, RouterModule, HostComponent, MainHeaderComponent, MobileDrawerComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        provideRouter([]),
        { provide: MobileNavService, useValue: nav },
        {
            provide: IHttpSecurityService,
            useValue: {
                getCurrentUserAsObservable: () => user$.asObservable(),
                getCurrentUser: () => user$.value,
                logout: jasmine.createSpy('logout'),
            },
        },
        { provide: SignalrService, useValue: { stop: () => { }, notification$: new Subject() } },
    ],
})
      // Solo las plantillas del header y del cajón: los hijos de otros contextos (info del usuario, avatar) se
      // sacan para no tener que proveer todos sus servicios.
      .overrideComponent(MainHeaderComponent, {
        remove: { imports: [SectionUserInfoLoginComponent] },
        add: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .overrideComponent(MobileDrawerComponent, {
        remove: { imports: [UserAvatarComponent] },
        add: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  };

  const usuarioNormal = { userName: 'yo', rango: 'Usuario', avatar: '' };

  it('muestra el botón hamburguesa accesible y arranca el seguimiento de contadores', async () => {
    await build(usuarioNormal);

    const toggle = el('#mobile-nav-toggle')!;
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-controls')).toBe('mobile-drawer');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(nav.watchStats).toHaveBeenCalled();
  });

  it('el botón abre el cajón y refleja aria-expanded; el cajón cerrado queda inerte', async () => {
    await build(usuarioNormal);

    expect(el('#mobile-drawer')!.hasAttribute('inert')).toBeTrue();

    el('#mobile-nav-toggle')!.click();
    fixture.detectChanges();

    expect(nav.toggle).toHaveBeenCalled();
    expect(el('#mobile-nav-toggle')!.getAttribute('aria-expanded')).toBe('true');
    expect(el('#mobile-drawer')!.hasAttribute('inert')).toBeFalse();
    expect(el('.drawer')!.classList.contains('drawer--open')).toBeTrue();
  });

  it('con sesión el cajón trae accesos rápidos, búsqueda, cuenta y salir', async () => {
    await build(usuarioNormal);
    nav.open();
    fixture.detectChanges();

    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('#mobile-drawer a')).map((a: any) => a.getAttribute('href'));
    expect(hrefs).toEqual(
      jasmine.arrayContaining(['/monitor', '/mensajes', '/favoritos', '/perfil/yo', '/crear/post', '/borradores', '/cuenta'])
    );
    expect(el('.drawer__search')).toBeTruthy();
    expect(el('.drawer__logout')).toBeTruthy();
    expect(el('.drawer__auth')).toBeNull();
  });

  it('invitado: botón "Entrar" en el header y login/registro en el cajón, sin búsqueda ni cuenta', async () => {
    await build(undefined);
    nav.open();
    fixture.detectChanges();

    expect(el('.mobile-actions__login')).toBeTruthy();
    expect(el('.drawer__auth')).toBeTruthy();
    expect(el('.drawer__search')).toBeNull();
    expect(el('.drawer__logout')).toBeNull();
  });

  it('solo muestra Moderación / Administración según el rango', async () => {
    await build({ userName: 'admin', rango: 'Administrador', avatar: '' });
    nav.open();
    fixture.detectChanges();
    const textoAdmin = el('#mobile-drawer')!.textContent;
    expect(textoAdmin).toContain('Administración');
    expect(textoAdmin).not.toContain('Moderación');

    user$.next({ usuario: { userName: 'mod', rango: 'Moderador', avatar: '' }, token: 't' });
    fixture.detectChanges();
    const textoMod = el('#mobile-drawer')!.textContent;
    expect(textoMod).toContain('Moderación');
    expect(textoMod).not.toContain('Administración');
  });

  it('el badge de la hamburguesa suma notificaciones y mensajes', async () => {
    await build(usuarioNormal);
    nav.stats.set({ notifications: 3, messages: 2 });
    fixture.detectChanges();

    expect(el('.mobile-actions__badge')!.textContent!.trim()).toBe('5');
    expect(el('#mobile-nav-toggle')!.getAttribute('aria-label')).toContain('5 sin leer');
  });

  it('Escape y el fondo oscuro cierran el cajón', async () => {
    await build(usuarioNormal);
    nav.open();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(nav.close).toHaveBeenCalledTimes(1);

    nav.open();
    fixture.detectChanges();
    el('.drawer-backdrop')!.click();
    expect(nav.close).toHaveBeenCalledTimes(2);
  });

  describe('gesto de deslizar para cerrar', () => {
    it('arrastrar a la derecha pasado el umbral cierra el cajón', async () => {
      await build(usuarioNormal);
      nav.open();

      drawer().onTouchStart(touch(100, 300));
      drawer().onTouchMove(touch(150, 305));
      expect(drawer().dragX()).toBe(50);
      drawer().onTouchMove(touch(200, 305));
      drawer().onTouchEnd();

      expect(nav.close).toHaveBeenCalled();
      expect(drawer().dragX()).toBe(0);
    });

    it('un arrastre corto no cierra y el cajón vuelve a su lugar', async () => {
      await build(usuarioNormal);
      nav.open();

      drawer().onTouchStart(touch(100, 300));
      drawer().onTouchMove(touch(140, 302));
      drawer().onTouchEnd();

      expect(nav.close).not.toHaveBeenCalled();
      expect(drawer().dragX()).toBe(0);
    });

    it('el scroll vertical no se interpreta como gesto', async () => {
      await build(usuarioNormal);
      nav.open();

      drawer().onTouchStart(touch(100, 100));
      drawer().onTouchMove(touch(130, 400));
      expect(drawer().dragX()).toBe(0);
      drawer().onTouchEnd();

      expect(nav.close).not.toHaveBeenCalled();
    });

    it('deslizar hacia la izquierda no mueve el cajón', async () => {
      await build(usuarioNormal);
      nav.open();

      drawer().onTouchStart(touch(200, 300));
      drawer().onTouchMove(touch(120, 300));

      expect(drawer().dragX()).toBe(0);
    });
  });

  describe('header que se esconde al bajar', () => {
    it('baja de verdad: se esconde; sube: reaparece', async () => {
      await build(usuarioNormal);

      header().onScrollFrame(300);
      expect(header().hidden).toBeTrue();

      header().onScrollFrame(200);
      expect(header().hidden).toBeFalse();
    });

    it('no se esconde cerca del inicio de la página', async () => {
      await build(usuarioNormal);

      header().onScrollFrame(60);

      expect(header().hidden).toBeFalse();
    });

    it('ignora movimientos mínimos de scroll', async () => {
      await build(usuarioNormal);
      header().onScrollFrame(300);
      header().onScrollFrame(200);

      header().onScrollFrame(204);

      expect(header().hidden).toBeFalse();
    });

    it('no se esconde con el cajón abierto', async () => {
      await build(usuarioNormal);
      nav.open();

      header().onScrollFrame(400);

      expect(header().hidden).toBeFalse();
    });

    it('si el foco entra al header (teclado) vuelve a verse', async () => {
      await build(usuarioNormal);
      header().onScrollFrame(400);
      expect(header().hidden).toBeTrue();

      header().onFocusIn();

      expect(header().hidden).toBeFalse();
    });
  });
});

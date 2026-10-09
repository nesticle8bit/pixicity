import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { IHttpBloqueosService } from 'src/app/services/interfaces/httpBloqueos.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AccountBloqueadosComponent } from './account-bloqueados/account-bloqueados.component';
import { passwordsIguales } from './account-password/account-password.component';

describe('Cuenta (componentes divididos)', () => {
  describe('passwordsIguales', () => {
    const grupo = (nueva: string, confirmacion: string) =>
      new FormGroup({ newPassword: new FormControl(nueva), confirmPassword: new FormControl(confirmacion) });

    it('marca notSame solo cuando ambas están escritas y no coinciden', () => {
      expect(passwordsIguales(grupo('abc', 'abd'))).toEqual({ notSame: true });
      expect(passwordsIguales(grupo('abc', 'abc'))).toBeNull();
      expect(passwordsIguales(grupo('abc', ''))).toBeNull();
    });
  });

  describe('AccountBloqueadosComponent', () => {
    let fixture: ComponentFixture<AccountBloqueadosComponent>;
    const bloqueos = { getBloqueados: jasmine.createSpy(), desbloquearUsuario: jasmine.createSpy() };
    const notificaciones = jasmine.createSpyObj('NotificationService', ['success']);

    beforeEach(async () => {
      bloqueos.getBloqueados.and.returnValue(of([{ id: 1, userName: 'beto', avatar: null }, { id: 2, userName: 'caro', avatar: 'c.jpeg' }]));
      bloqueos.desbloquearUsuario.and.returnValue(of(true));
      await TestBed.configureTestingModule({
        imports: [AccountBloqueadosComponent],
        providers: [
          provideRouter([]),
          { provide: IHttpBloqueosService, useValue: bloqueos },
          { provide: NotificationService, useValue: notificaciones },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();
      fixture = TestBed.createComponent(AccountBloqueadosComponent);
      fixture.detectChanges();
    });

    it('lista los bloqueados con enlace al perfil (antes apuntaba a /u/, que no existe)', () => {
      const enlaces = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('a'));
      expect(enlaces.map((a) => a.getAttribute('href'))).toEqual(['/perfil/beto', '/perfil/caro']);
    });

    it('desbloquear lo quita de la lista y avisa', () => {
      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      expect(bloqueos.desbloquearUsuario).toHaveBeenCalledWith(1);
      expect(fixture.nativeElement.querySelectorAll('a').length).toBe(1);
      expect(notificaciones.success).toHaveBeenCalled();
    });
  });
});

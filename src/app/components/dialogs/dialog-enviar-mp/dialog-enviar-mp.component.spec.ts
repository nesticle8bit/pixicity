import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { DialogEnviarMPComponent } from './dialog-enviar-mp.component';

describe('DialogEnviarMPComponent', () => {
  let mensajes: jasmine.SpyObj<IHttpMensajesService>;
  let cerrar: jasmine.Spy;

  function crear(rango = 'Usuario', clave: string | null = 'clave-publica'): DialogEnviarMPComponent {
    mensajes = jasmine.createSpyObj('IHttpMensajesService', ['sendMensajePrivado']);
    cerrar = jasmine.createSpy('close');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MatDialogRef, useValue: { close: cerrar } },
        { provide: MAT_DIALOG_DATA, useValue: { userName: 'ana' } },
        { provide: IHttpMensajesService, useValue: mensajes },
        { provide: IHttpUsuarioPerfilService, useValue: { sugerirMenciones: () => of([]) } },
        {
          provide: IHttpSecurityService,
          useValue: { getCurrentUser: () => ({ usuario: { userName: 'yo', rango } }), getCaptchaSiteKey: () => of(clave) },
        },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['success', 'error']) },
      ],
    });
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const c = TestBed.runInInjectionContext(() => new DialogEnviarMPComponent());
    c.ngOnInit();
    c.formGroup.patchValue({ contenido: '<p>hola</p>' });
    return c;
  }

  it('con captcha activo no envía hasta resolverlo, y manda el token al API', () => {
    const c = crear();
    mensajes.sendMensajePrivado.and.returnValue(of({ type: 'id', message: '5' }));

    c.enviarMP();
    expect(mensajes.sendMensajePrivado).not.toHaveBeenCalled();

    c.captchaResponse('token-1');
    c.enviarMP();
    expect(mensajes.sendMensajePrivado).toHaveBeenCalledWith(jasmine.objectContaining({ aUserName: 'ana' }), 'token-1');
    expect(cerrar).toHaveBeenCalledWith(true);
  });

  it('si el API rechaza el captcha muestra el error y pide uno nuevo', () => {
    const c = crear();
    mensajes.sendMensajePrivado.and.returnValue(of({ type: 'captcha', message: 'No pudimos verificar que no eres un robot.' }));

    c.captchaResponse('token-1');
    c.enviarMP();

    expect(c.error()).toContain('robot');
    expect(c.sinCaptcha).toBeTrue();
    expect(cerrar).not.toHaveBeenCalled();
  });

  it('el staff no ve el captcha', () => {
    const c = crear('Moderador');
    mensajes.sendMensajePrivado.and.returnValue(of({ type: 'id', message: '5' }));

    expect(c.captchaSiteKey()).toBeNull();
    c.enviarMP();
    expect(mensajes.sendMensajePrivado).toHaveBeenCalledWith(jasmine.anything(), null);
  });
});

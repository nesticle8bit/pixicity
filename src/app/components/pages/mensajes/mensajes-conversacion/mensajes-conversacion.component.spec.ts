import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';

import { MensajesConversacionComponent } from './mensajes-conversacion.component';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';

const ana = { id: 2, userName: 'ana', avatar: '' };

const msg = (id: number, esMio = false, extra: any = {}) => ({
  id,
  esMio,
  leido: false,
  asunto: '',
  contenido: `m${id}`,
  fechaRegistro: new Date(2026, 9, 1, 10, id).toISOString(),
  ...extra,
});

describe('MensajesConversacionComponent', () => {
  let fixture: ComponentFixture<MensajesConversacionComponent>;
  let component: MensajesConversacionComponent;

  let mensajes: jasmine.SpyObj<IHttpMensajesService>;
  let fotos: jasmine.SpyObj<IHttpFotosService>;
  let notificaciones: jasmine.SpyObj<NotificationService>;
  let signalr: {
    mensaje$: Subject<any>;
    mensajesLeidos$: Subject<any>;
    escribiendo$: Subject<any>;
    notifyTyping: jasmine.Spy;
  };

  const crear = (primeraPagina: any) => {
    mensajes.getConversacion.and.returnValue(of(primeraPagina));
    fixture = TestBed.createComponent(MensajesConversacionComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async () => {
    mensajes = jasmine.createSpyObj('IHttpMensajesService', [
      'getConversacion',
      'sendMensajePrivado',
      'deleteMensajesById',
    ]);
    fotos = jasmine.createSpyObj('IHttpFotosService', ['uploadImage']);
    notificaciones = jasmine.createSpyObj('NotificationService', ['error', 'success']);
    signalr = {
      mensaje$: new Subject(),
      mensajesLeidos$: new Subject(),
      escribiendo$: new Subject(),
      notifyTyping: jasmine.createSpy('notifyTyping'),
    };

    await TestBed.configureTestingModule({
      declarations: [MensajesConversacionComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: IHttpMensajesService, useValue: mensajes },
        { provide: IHttpFotosService, useValue: fotos },
        { provide: NotificationService, useValue: notificaciones },
        { provide: SignalrService, useValue: signalr },
        { provide: DisplayComponentService, useValue: { setDisplay: () => {} } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ userName: 'ana' })) } },
      ],
    })
      // Se prueba la lógica del componente; el template depende de pipes/componentes de otros módulos.
      .overrideComponent(MensajesConversacionComponent, { set: { template: '' } })
      .compileComponents();
  });

  it('carga la primera página con el interlocutor y el estado de bloqueo', fakeAsync(() => {
    crear({ mensajes: [msg(1), msg(2, true)], hayMas: true, bloqueado: true, otro: ana });

    expect(mensajes.getConversacion).toHaveBeenCalledWith(jasmine.objectContaining({ userName: 'ana', take: 30 }));
    expect(component.otro).toEqual(ana);
    expect(component.mensajes.length).toBe(2);
    expect(component.hayMas).toBeTrue();
    expect(component.bloqueado).toBeTrue();
    flush();
  }));

  it('cargarAnteriores antepone la página previa usando el id del más antiguo', fakeAsync(() => {
    crear({ mensajes: [msg(10), msg(11)], hayMas: true, bloqueado: false, otro: ana });
    mensajes.getConversacion.and.returnValue(of({ mensajes: [msg(8), msg(9)], hayMas: false, bloqueado: false, otro: ana }));

    component.cargarAnteriores();
    flush();

    expect(mensajes.getConversacion).toHaveBeenCalledWith({ userName: 'ana', antesDeId: 10, take: 30 });
    expect(component.mensajes.map((m) => m.id)).toEqual([8, 9, 10, 11]);
    expect(component.hayMas).toBeFalse();
  }));

  it('un mensaje en vivo se fusiona sin duplicar y queda ordenado', fakeAsync(() => {
    crear({ mensajes: [msg(1), msg(2)], hayMas: false, bloqueado: false, otro: ana });
    mensajes.getConversacion.and.returnValue(
      of({ mensajes: [msg(1), msg(2), msg(3)], hayMas: false, bloqueado: false, otro: ana })
    );

    signalr.mensaje$.next({ id: 3, otroId: 2, esMio: false });
    flush();

    expect(component.mensajes.map((m) => m.id)).toEqual([1, 2, 3]);
  }));

  it('ignora mensajes en vivo de otra conversación', fakeAsync(() => {
    crear({ mensajes: [msg(1)], hayMas: false, bloqueado: false, otro: ana });
    mensajes.getConversacion.calls.reset();

    signalr.mensaje$.next({ id: 9, otroId: 99, esMio: false });
    flush();

    expect(mensajes.getConversacion).not.toHaveBeenCalled();
  }));

  it('cuando el otro lee, mis mensajes pasan a leídos', fakeAsync(() => {
    crear({ mensajes: [msg(1, true), msg(2, false)], hayMas: false, bloqueado: false, otro: ana });

    signalr.mensajesLeidos$.next({ porId: 2 });

    expect(component.mensajes[0].leido).toBeTrue();
    expect(component.mensajes[1].leido).toBeFalse();
    flush();
  }));

  it('muestra "escribiendo" y lo oculta tras unos segundos', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, otro: ana });

    signalr.escribiendo$.next({ porId: 2 });
    expect(component.escribiendo).toBeTrue();

    tick(3600);
    expect(component.escribiendo).toBeFalse();
    flush();
  }));

  it('avisa "escribiendo" como máximo una vez cada 2.5s y solo con texto', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, otro: ana });

    component.respuesta = '';
    component.onTyping();
    expect(signalr.notifyTyping).not.toHaveBeenCalled();

    component.respuesta = 'ho';
    component.onTyping();
    component.respuesta = 'hol';
    component.onTyping();
    expect(signalr.notifyTyping).toHaveBeenCalledTimes(1);
    expect(signalr.notifyTyping).toHaveBeenCalledWith(2);
    flush();
  }));

  it('responder envía sin asunto, convierte saltos de línea y limpia el cuadro', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, otro: ana });
    mensajes.sendMensajePrivado.and.returnValue(of({ type: 'id', message: '5' }));

    component.respuesta = '  hola\nque tal  ';
    component.responderMensaje();
    flush();

    expect(mensajes.sendMensajePrivado).toHaveBeenCalledWith({
      aUserName: 'ana',
      asunto: '',
      contenido: 'hola<br>que tal',
    });
    expect(component.respuesta).toBe('');
  }));

  it('no envía si el otro usuario me bloqueó', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: true, otro: ana });

    component.respuesta = 'hola';
    component.responderMensaje();
    flush();

    expect(mensajes.sendMensajePrivado).not.toHaveBeenCalled();
  }));

  it('muestra el error del servidor y conserva el texto si el envío falla', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, otro: ana });
    mensajes.sendMensajePrivado.and.returnValue(of({ type: 'error', message: 'muy rápido' }));

    component.respuesta = 'hola';
    component.responderMensaje();
    flush();

    expect(notificaciones.error).toHaveBeenCalledWith('muy rápido', 'Error');
    expect(component.respuesta).toBe('hola');
    expect(component.enviando).toBeFalse();
  }));

  it('eliminar quita el mensaje de la vista solo si se confirma', fakeAsync(() => {
    crear({ mensajes: [msg(1), msg(2)], hayMas: false, bloqueado: false, otro: ana });
    mensajes.deleteMensajesById.and.returnValue(of(true));

    spyOn(window, 'confirm').and.returnValue(false);
    component.eliminarMensaje(component.mensajes[0]);
    expect(mensajes.deleteMensajesById).not.toHaveBeenCalled();

    (window.confirm as jasmine.Spy).and.returnValue(true);
    component.eliminarMensaje(component.mensajes[0]);
    flush();

    expect(mensajes.deleteMensajesById).toHaveBeenCalledWith([1]);
    expect(component.mensajes.map((m) => m.id)).toEqual([2]);
  }));

  it('adjuntar imagen la sube y la envía como mensaje', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, otro: ana });
    fotos.uploadImage.and.returnValue(of('/images/fotos/yo/a.jpg'));
    mensajes.sendMensajePrivado.and.returnValue(of({ type: 'id', message: '7' }));

    const file = new File(['x'], 'a.png', { type: 'image/png' });
    component.adjuntarImagen({ target: { files: [file], value: 'a.png' } } as any);
    flush();

    expect(fotos.uploadImage).toHaveBeenCalledWith(file);
    expect(mensajes.sendMensajePrivado).toHaveBeenCalledWith(
      jasmine.objectContaining({ contenido: '<img src="/images/fotos/yo/a.jpg" alt="Imagen adjunta">' })
    );
  }));

  it('rechaza adjuntos que no son imágenes', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, otro: ana });

    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    component.adjuntarImagen({ target: { files: [file], value: 'a.pdf' } } as any);
    flush();

    expect(fotos.uploadImage).not.toHaveBeenCalled();
    expect(notificaciones.error).toHaveBeenCalled();
  }));

  it('esNuevoDia separa los mensajes por fecha', fakeAsync(() => {
    crear({
      mensajes: [
        msg(1, false, { fechaRegistro: new Date(2026, 9, 1, 23, 0).toISOString() }),
        msg(2, false, { fechaRegistro: new Date(2026, 9, 1, 23, 30).toISOString() }),
        msg(3, false, { fechaRegistro: new Date(2026, 9, 2, 8, 0).toISOString() }),
      ],
      hayMas: false,
      bloqueado: false,
      otro: ana,
    });

    expect([0, 1, 2].map((i) => component.esNuevoDia(i))).toEqual([true, false, true]);
    flush();
  }));
});

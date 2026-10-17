import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';

import { MensajesConversacionComponent } from './mensajes-conversacion.component';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
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
  let router: jasmine.SpyObj<Router>;
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
      'subirImagenMensaje',
      'silenciarConversacion',
      'archivarConversaciones',
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    notificaciones = jasmine.createSpyObj('NotificationService', ['error', 'success', 'info']);
    signalr = {
      mensaje$: new Subject(),
      mensajesLeidos$: new Subject(),
      escribiendo$: new Subject(),
      notifyTyping: jasmine.createSpy('notifyTyping'),
    };

    await TestBed.configureTestingModule({
    imports: [FormsModule, MensajesConversacionComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        { provide: IHttpMensajesService, useValue: mensajes },
        { provide: Router, useValue: router },
        { provide: NotificationService, useValue: notificaciones },
        { provide: SignalrService, useValue: signalr },
        { provide: DisplayComponentService, useValue: { setDisplay: () => { } } },
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
      imagenes: [],
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

  it('adjuntar imágenes las sube al elegirlas y se envían con el mensaje (aunque no haya texto)', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, otro: ana });
    mensajes.subirImagenMensaje.and.returnValues(of('/images/mensajes/yo/a.webp'), of('/images/mensajes/yo/b.webp'));
    mensajes.sendMensajePrivado.and.returnValue(of({ type: 'id', message: '7' }));

    const a = new File(['x'], 'a.png', { type: 'image/png' });
    const b = new File(['y'], 'b.jpg', { type: 'image/jpeg' });
    component.adjuntarImagen({ target: { files: [a, b], value: 'a.png' } } as any);
    flush();

    expect(mensajes.subirImagenMensaje).toHaveBeenCalledTimes(2);
    expect(component.adjuntos.length).toBe(2);
    expect(component.puedeEnviar).toBeTrue();
    expect(mensajes.sendMensajePrivado).not.toHaveBeenCalled(); // se envía al apretar Enviar

    component.responderMensaje();
    flush();

    expect(mensajes.sendMensajePrivado).toHaveBeenCalledWith(
      jasmine.objectContaining({ contenido: '', imagenes: ['/images/mensajes/yo/a.webp', '/images/mensajes/yo/b.webp'] }),
    );
    expect(component.adjuntos.length).toBe(0);
  }));

  it('no deja adjuntar más de 4 imágenes', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, otro: ana });
    mensajes.subirImagenMensaje.and.returnValue(of('/images/mensajes/yo/x.webp'));

    const files = [1, 2, 3, 4, 5].map((n) => new File(['x'], `${n}.png`, { type: 'image/png' }));
    component.adjuntarImagen({ target: { files, value: '' } } as any);
    flush();

    expect(mensajes.subirImagenMensaje).toHaveBeenCalledTimes(4);
    expect(notificaciones.info).toHaveBeenCalled();
  }));

  it('rechaza adjuntos que no son imágenes', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, otro: ana });

    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    component.adjuntarImagen({ target: { files: [file], value: 'a.pdf' } } as any);
    flush();

    expect(mensajes.subirImagenMensaje).not.toHaveBeenCalled();
    expect(notificaciones.error).toHaveBeenCalled();
  }));

  it('imagenesDe parte las URLs y "Visto" va en el último mensaje mío leído', fakeAsync(() => {
    crear({
      mensajes: [msg(1), msg(2, true, { leido: true, fechaLeido: '2026-10-01T10:05:00Z', imagenes: '/a.webp\n/b.webp' }), msg(3, true)],
      hayMas: false,
      bloqueado: false,
      otro: ana,
    });
    flush();

    expect(component.imagenesDe(component.mensajes[1])).toEqual(['/a.webp', '/b.webp']);
    expect(component.idUltimoVisto).toBe(2);

    signalr.mensajesLeidos$.next({ porId: 2, fecha: '2026-10-01T10:09:00Z' });
    expect(component.idUltimoVisto).toBe(3);
    expect(component.mensajes[2].fechaLeido).toBe('2026-10-01T10:09:00Z');
  }));

  it('silenciar y archivar desde el chat', fakeAsync(() => {
    crear({ mensajes: [], hayMas: false, bloqueado: false, silenciada: false, otro: ana });
    mensajes.silenciarConversacion.and.returnValue(of(true));
    mensajes.archivarConversaciones.and.returnValue(of(true));
    flush();

    component.alternarSilencio();
    expect(mensajes.silenciarConversacion).toHaveBeenCalledWith(2, true);
    expect(component.silenciada).toBeTrue();

    component.archivar();
    expect(mensajes.archivarConversaciones).toHaveBeenCalledWith([2], true);
    expect(router.navigate).toHaveBeenCalledWith(['/mensajes']);
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

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { MensajesComponent } from './mensajes.component';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';

const conv = (otroId: number, noLeidos = 0, extra: any = {}) => ({
  ultimoMensajeId: otroId * 10,
  fechaRegistro: new Date().toISOString(),
  contenido: `<p>hola <b>${otroId}</b></p>`,
  esMio: false,
  leido: noLeidos === 0,
  noLeidos,
  otro: { id: otroId, userName: `user${otroId}`, avatar: '' },
  ...extra,
});

describe('MensajesComponent (bandeja de conversaciones)', () => {
  let fixture: ComponentFixture<MensajesComponent>;
  let component: MensajesComponent;
  let mensajes: jasmine.SpyObj<IHttpMensajesService>;
  let notificaciones: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;
  let mensaje$: Subject<any>;
  let leidos$: Subject<any>;

  const pagina = (...items: any[]) => ({
    conversaciones: items,
    archivadas: 2,
    pagination: { totalCount: items.length, pageSize: 10, currentPage: 1, totalPages: 1 },
  });

  beforeEach(async () => {
    mensajes = jasmine.createSpyObj('IHttpMensajesService', ['getConversaciones', 'deleteConversaciones', 'archivarConversaciones', 'silenciarConversacion']);
    notificaciones = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    mensaje$ = new Subject();
    leidos$ = new Subject();

    mensajes.getConversaciones.and.returnValue(of(pagina(conv(1, 2), conv(2, 0), conv(3, 3))));

    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, MensajesComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        { provide: IHttpMensajesService, useValue: mensajes },
        { provide: NotificationService, useValue: notificaciones },
        { provide: Router, useValue: router },
        { provide: SignalrService, useValue: { mensaje$, mensajesLeidos$: leidos$ } },
        { provide: DisplayComponentService, useValue: { setDisplay: () => { } } },
        { provide: PaginationService, useValue: { change: () => { }, pageCount: 10, selectItemsPerPage: [10] } },
    ],
})
      // Se prueba la lógica; el template usa pipes y componentes de otros módulos.
      .overrideComponent(MensajesComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(MensajesComponent);
    component = fixture.componentInstance;
  });

  it('carga las conversaciones y suma los no leídos', () => {
    expect(component.conversaciones.length).toBe(3);
    expect(component.totalCount).toBe(3);
    expect(component.unreadCount).toBe(5);
  });

  it('abrir navega al chat con el usuario', () => {
    component.abrir(component.conversaciones[0]);

    expect(router.navigate).toHaveBeenCalledWith(['/mensajes/chat', 'user1']);
  });

  it('un mensaje en vivo recarga la bandeja y conserva la selección', () => {
    component.conversaciones[1].selected = true;
    mensajes.getConversaciones.calls.reset();
    mensajes.getConversaciones.and.returnValue(of(pagina(conv(2, 1), conv(1, 2), conv(3, 3))));

    mensaje$.next({ id: 1, otroId: 2, esMio: false });

    expect(mensajes.getConversaciones).toHaveBeenCalledTimes(1);
    expect(component.conversaciones[0].otro.id).toBe(2);
    expect(component.conversaciones[0].selected).toBeTrue();
    expect(component.conversaciones[1].selected).toBeFalse();
  });

  it('eliminar manda los ids de los interlocutores seleccionados y recarga', () => {
    component.conversaciones[0].selected = true;
    component.conversaciones[2].selected = true;
    mensajes.deleteConversaciones.and.returnValue(of(true));
    mensajes.getConversaciones.calls.reset();

    component.deleteConversaciones();

    expect(mensajes.deleteConversaciones).toHaveBeenCalledWith([1, 3]);
    expect(notificaciones.success).toHaveBeenCalled();
    expect(mensajes.getConversaciones).toHaveBeenCalled();
  });

  it('eliminar sin selección no llama al servidor', () => {
    component.deleteConversaciones();

    expect(mensajes.deleteConversaciones).not.toHaveBeenCalled();
  });

  it('seleccionar todo e indeterminado reflejan la selección', () => {
    component.toggleAll(true);
    expect(component.allSelected).toBeTrue();
    expect(component.someSelected).toBeFalse();

    component.conversaciones[0].selected = false;
    expect(component.someSelected).toBeTrue();
  });

  it('preview deja solo texto plano y recorta', () => {
    expect(component.preview('<p>hola <b>mundo</b></p>')).toBe('hola mundo');
    expect(component.preview('<p>' + 'a'.repeat(200) + '</p>', 10)).toBe('aaaaaaaaaa…');
    expect(component.preview('')).toBe('');
  });

  it('archivar manda los seleccionados y la pestaña Archivadas pide esa carpeta', () => {
    expect(component.totalArchivadas).toBe(2);
    component.conversaciones[0].selected = true;
    mensajes.archivarConversaciones.and.returnValue(of(true));

    component.archivar();
    expect(mensajes.archivarConversaciones).toHaveBeenCalledWith([1], true);

    mensajes.getConversaciones.calls.reset();
    component.verCarpeta(true);
    expect(mensajes.getConversaciones).toHaveBeenCalledWith(true);

    // En Archivadas, la misma acción las devuelve a la bandeja.
    component.archivar(component.conversaciones[0]);
    expect(mensajes.archivarConversaciones).toHaveBeenCalledWith([1], false);
  });

  it('silenciar alterna el estado de la fila', () => {
    mensajes.silenciarConversacion.and.returnValue(of(true));
    component.silenciar(component.conversaciones[0]);

    expect(mensajes.silenciarConversacion).toHaveBeenCalledWith(1, true);
    expect(component.conversaciones[0].silenciada).toBeTrue();
  });

  it('la confirmación de lectura en vivo marca "Visto" en mi último mensaje', () => {
    mensajes.getConversaciones.and.returnValue(of(pagina(conv(4, 0, { esMio: true, leido: false }))));
    component.getConversaciones();

    leidos$.next({ porId: 4, fecha: '2026-10-16T12:00:00Z' });

    expect(component.conversaciones[0].leido).toBeTrue();
    expect(component.conversaciones[0].fechaLeido).toBe('2026-10-16T12:00:00Z');
  });

  it('un mensaje con solo imágenes se resume como "Foto"', () => {
    const fila: any = { ...conv(5), contenido: '', cantidadImagenes: 1, selected: false };
    expect(component.vistaPrevia(fila)).toBe('Foto');
    expect(component.vistaPrevia({ ...fila, cantidadImagenes: 3 })).toBe('3 fotos');
    expect(component.esSoloImagen(fila)).toBeTrue();
  });
});

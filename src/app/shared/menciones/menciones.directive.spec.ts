import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { MencionesDirective } from './menciones.directive';

@Component({
  imports: [MencionesDirective],
  template: `<textarea appMenciones></textarea>`,
})
class HostComponent {}

describe('MencionesDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let sugerir: jasmine.Spy;
  let campo: HTMLTextAreaElement;

  beforeEach(() => {
    sugerir = jasmine.createSpy('sugerirMenciones').and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: IHttpUsuarioPerfilService, useValue: { sugerirMenciones: sugerir } }],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    campo = fixture.nativeElement.querySelector('textarea');
  });

  /** Simula una tecla: agrega el carácter, deja el cursor al final y dispara "input". */
  function teclear(texto: string): void {
    for (const letra of texto) {
      campo.value += letra;
      campo.setSelectionRange(campo.value.length, campo.value.length);
      campo.dispatchEvent(new Event('input'));
      tick(50); // más rápido que la espera de 200 ms
    }
  }

  it('no consulta en cada tecla: una sola consulta con lo último escrito', fakeAsync(() => {
    teclear('Hola @aut');
    tick(200);

    expect(sugerir.calls.allArgs()).toEqual([['aut']]);
  }));

  it('si el cursor deja la mención antes de la espera, no consulta', fakeAsync(() => {
    teclear('@an');
    teclear(' ');
    tick(200);

    expect(sugerir).not.toHaveBeenCalled();
  }));
});

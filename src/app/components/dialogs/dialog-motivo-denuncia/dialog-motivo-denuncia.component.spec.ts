import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogMotivoDenunciaComponent } from './dialog-motivo-denuncia.component';

describe('DialogMotivoDenunciaComponent', () => {
  let cerrar: jasmine.Spy;
  let fixture: ComponentFixture<DialogMotivoDenunciaComponent>;

  function crear(): HTMLElement {
    cerrar = jasmine.createSpy('close');
    TestBed.configureTestingModule({
      imports: [DialogMotivoDenunciaComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { que: 'comentario', motivos: ['Spam o publicidad', 'Acoso', 'Otro'] } },
        { provide: MatDialogRef, useValue: { close: cerrar } },
      ],
    });
    fixture = TestBed.createComponent(DialogMotivoDenunciaComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  const enviar = (el: HTMLElement) => {
    fixture.detectChanges();
    return el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  };
  const opcion = (el: HTMLElement, texto: string) =>
    Array.from(el.querySelectorAll<HTMLInputElement>('input[type="radio"]')).find((r) => r.value === texto)!;
  const escribir = (el: HTMLElement, texto: string) => {
    const campo = el.querySelector<HTMLTextAreaElement>('textarea')!;
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
  };

  it('no deja enviar sin elegir motivo, y con un motivo de la lista lo devuelve', () => {
    const el = crear();
    expect(enviar(el).disabled).toBeTrue();

    opcion(el, 'Acoso').click();
    expect(enviar(el).disabled).toBeFalse();
    enviar(el).click();

    expect(cerrar).toHaveBeenCalledWith('Acoso');
  });

  it('agrega la aclaración al motivo elegido', () => {
    const el = crear();
    opcion(el, 'Spam o publicidad').click();
    escribir(el, '  vende cursos  ');
    enviar(el).click();

    expect(cerrar).toHaveBeenCalledWith('Spam o publicidad: vende cursos');
  });

  it('"Otro" exige escribir el motivo y manda solo el texto', () => {
    const el = crear();
    opcion(el, 'Otro').click();
    expect(enviar(el).disabled).toBeTrue();

    escribir(el, 'Copia un post ajeno');
    enviar(el).click();

    expect(cerrar).toHaveBeenCalledWith('Copia un post ajeno');
  });
});

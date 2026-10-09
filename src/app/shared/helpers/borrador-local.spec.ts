import { DestroyRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { BorradorLocal } from './borrador-local';

describe('BorradorLocal', () => {
  const CLAVE = 'taringas:borrador:ana:post:nuevo';
  let destruir: (() => void)[];
  const destroyRef = { onDestroy: (fn: () => void) => destruir.push(fn) } as unknown as DestroyRef;

  const formulario = (titulo = '', contenido = '') =>
    new FormGroup({ titulo: new FormControl(titulo), contenido: new FormControl(contenido), esPrivado: new FormControl(false) });

  beforeEach(() => {
    destruir = [];
    localStorage.removeItem(CLAVE);
  });

  afterEach(() => {
    destruir.forEach((fn) => fn());
    localStorage.removeItem(CLAVE);
  });

  it('guarda lo que escribe la persona (con pausa) y no lo que se cargó al editar', fakeAsync(() => {
    const form = formulario('Cargado', '<p>del servidor</p>');
    new BorradorLocal('post:nuevo', 'ana', form, destroyRef).iniciar();

    form.patchValue({ titulo: 'Cargado 2' }); // sin dirty: valor de carga
    tick(1000);
    expect(localStorage.getItem(CLAVE)).toBeNull();

    form.markAsDirty();
    form.patchValue({ contenido: '<p>texto nuevo</p>' });
    tick(500);
    expect(localStorage.getItem(CLAVE)).toBeNull(); // todavía dentro de la pausa
    tick(400);
    expect(JSON.parse(localStorage.getItem(CLAVE)!).valor.contenido).toBe('<p>texto nuevo</p>');
  }));

  it('no guarda un formulario sin texto (solo etiquetas HTML vacías)', fakeAsync(() => {
    const form = formulario();
    new BorradorLocal('post:nuevo', 'ana', form, destroyRef).iniciar();
    form.markAsDirty();
    form.patchValue({ contenido: '<p><br></p>' });
    tick(1000);
    expect(localStorage.getItem(CLAVE)).toBeNull();
  }));

  it('ofrece recuperar un borrador distinto de lo que muestra el formulario', () => {
    localStorage.setItem(CLAVE, JSON.stringify({ valor: { titulo: 'Mi borrador', contenido: '<p>x</p>', esPrivado: true }, fecha: Date.now() }));
    const form = formulario();
    const borrador = new BorradorLocal('post:nuevo', 'ana', form, destroyRef);
    borrador.iniciar();

    expect(borrador.pendiente?.valor['titulo']).toBe('Mi borrador');
    borrador.recuperar();
    expect(form.value).toEqual({ titulo: 'Mi borrador', contenido: '<p>x</p>', esPrivado: true });
    expect(form.dirty).toBeTrue();
    expect(borrador.pendiente).toBeNull();
  });

  it('descartar y limpiar borran el borrador', () => {
    localStorage.setItem(CLAVE, JSON.stringify({ valor: { titulo: 'Viejo', contenido: '', esPrivado: false }, fecha: Date.now() }));
    const borrador = new BorradorLocal('post:nuevo', 'ana', formulario(), destroyRef);
    borrador.iniciar();
    borrador.descartar();
    expect(borrador.pendiente).toBeNull();
    expect(localStorage.getItem(CLAVE)).toBeNull();
  });

  it('ignora borradores vencidos (más de 30 días) o corruptos', () => {
    localStorage.setItem(CLAVE, JSON.stringify({ valor: { titulo: 'Viejo' }, fecha: Date.now() - 31 * 86400000 }));
    const b1 = new BorradorLocal('post:nuevo', 'ana', formulario(), destroyRef);
    b1.iniciar();
    expect(b1.pendiente).toBeNull();
    expect(localStorage.getItem(CLAVE)).toBeNull();

    localStorage.setItem(CLAVE, '{no es json');
    const b2 = new BorradorLocal('post:nuevo', 'ana', formulario(), destroyRef);
    b2.iniciar();
    expect(b2.pendiente).toBeNull();
  });

  it('cada usuario tiene sus propios borradores', () => {
    localStorage.setItem(CLAVE, JSON.stringify({ valor: { titulo: 'De Ana', contenido: '', esPrivado: false }, fecha: Date.now() }));
    const deOtro = new BorradorLocal('post:nuevo', 'beto', formulario(), destroyRef);
    deOtro.iniciar();
    expect(deOtro.pendiente).toBeNull();
  });
});

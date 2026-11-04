import { effect, signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CargaGlobal } from './carga-global';

describe('CargaGlobal', () => {
  it('una petición lanzada desde un effect no lo vuelve a disparar al ocultarse el loader', fakeAsync(() => {
    const carga = TestBed.inject(CargaGlobal);
    const usuario = signal('ana');
    let ejecuciones = 0;

    TestBed.runInInjectionContext(() =>
      effect(() => {
        usuario();
        ejecuciones++;
        carga.empezar(); // lo que hace el interceptor al salir la petición
      }),
    );
    TestBed.tick();
    carga.terminar();
    tick(400);
    TestBed.tick();

    expect(carga.visible()).toBeFalse();
    expect(ejecuciones).toBe(1);

    usuario.set('beto');
    TestBed.tick();
    expect(ejecuciones).toBe(2);
    carga.terminar();
    tick(400);
  }));
});

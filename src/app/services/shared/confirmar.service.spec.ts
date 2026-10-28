import { TestBed } from '@angular/core/testing';
import { ConfirmarService } from './confirmar.service';

describe('ConfirmarService', () => {
  let servicio: ConfirmarService;

  beforeEach(() => {
    servicio = TestBed.inject(ConfirmarService);
  });

  it('confirmar resuelve true al aceptar y false al cancelar', async () => {
    const si = servicio.confirmar('¿Seguro?');
    servicio.responder('');
    expect(await si).toBeTrue();

    const no = servicio.confirmar('¿Seguro?');
    servicio.responder(null);
    expect(await no).toBeFalse();
  });

  it('pedirTexto devuelve el texto o null', async () => {
    const texto = servicio.pedirTexto('¿Por qué?');
    expect(servicio.actual()?.conTexto).toBeTrue();
    servicio.responder('spam');
    expect(await texto).toBe('spam');
  });

  it('muestra los pedidos simultáneos en orden', async () => {
    const primero = servicio.confirmar('uno');
    const segundo = servicio.confirmar('dos');
    expect(servicio.actual()?.mensaje).toBe('uno');
    servicio.responder('');
    expect(servicio.actual()?.mensaje).toBe('dos');
    servicio.responder(null);
    expect(await primero).toBeTrue();
    expect(await segundo).toBeFalse();
    expect(servicio.actual()).toBeNull();
  });

  it('marca como peligrosos los mensajes de borrar salvo que se indique', () => {
    servicio.confirmar('¿Eliminar este post?');
    expect(servicio.actual()?.peligro).toBeTrue();
    servicio.responder(null);
    servicio.confirmar({ mensaje: '¿Eliminar?', peligro: false });
    expect(servicio.actual()?.peligro).toBeFalse();
  });
});

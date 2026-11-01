import { MuroPerfilItem } from 'src/app/models/perfil/perfil-muro.model';
import { armarBloques, etiquetaDia, iconoActividad } from './linea-de-tiempo';

const AHORA = new Date(2026, 10, 1, 15, 0); // domingo 1 nov 2026, 15:00

function actividad(clave: string, fecha: Date, tipoActividad = 11, extra: Partial<MuroPerfilItem['actividad']> = {}): MuroPerfilItem {
  return {
    tipo: 'actividad', clave, fecha: fecha.toISOString(), shout: null, compartidoPor: null, post: null,
    actividad: { id: 1, fechaRegistro: fecha.toISOString(), tipoActividad, accion: 'Le gustó un shout de', tipo: 'shout', ...extra },
  };
}

function shout(clave: string, fecha: Date): MuroPerfilItem {
  return { tipo: 'shout', clave, fecha: fecha.toISOString(), shout: { id: 1 } as never, compartidoPor: null, post: null, actividad: null };
}

describe('Línea de tiempo del perfil', () => {
  it('etiqueta los días: hoy, ayer, día de la semana y después la fecha', () => {
    expect(etiquetaDia(new Date(2026, 10, 1, 0, 5), AHORA)).toBe('Hoy');
    expect(etiquetaDia(new Date(2026, 9, 31, 23, 59), AHORA)).toBe('Ayer');
    expect(etiquetaDia(new Date(2026, 9, 28, 12), AHORA)).toBe('Miércoles');
    expect(etiquetaDia(new Date(2026, 9, 9, 12), AHORA)).toBe('9 oct');
    expect(etiquetaDia(new Date(2025, 11, 24, 12), AHORA)).toMatch(/^24 dic 2025$/);
  });

  it('pone un separador por día y pliega las tandas largas de reacciones', () => {
    const hoy = (h: number) => new Date(2026, 10, 1, h);
    const items = [
      shout('s1', hoy(14)),
      actividad('a1', hoy(13)), actividad('a2', hoy(12)), actividad('a3', hoy(11)), actividad('a4', hoy(10)),
      actividad('c1', hoy(9), 17, { tipo: 'tema', extracto: 'buen tema' }),
      actividad('a5', new Date(2026, 9, 31, 20)),
    ];

    const bloques = armarBloques(items, new Set(), AHORA);

    expect(bloques.map((b) => (b.tipo === 'grupo' ? `+${b.ocultos}` : b.tipo === 'dia' ? b.etiqueta : b.clave)))
      .toEqual(['Hoy', 's1', 'a1', 'a2', '+2', 'c1', 'Ayer', 'a5']);
  });

  it('una tanda desplegada se ve entera y una corta nunca se pliega', () => {
    const hoy = (h: number) => new Date(2026, 10, 1, h);
    const larga = [actividad('a1', hoy(13)), actividad('a2', hoy(12)), actividad('a3', hoy(11)), actividad('a4', hoy(10))];
    expect(armarBloques(larga, new Set(['a1']), AHORA).filter((b) => b.tipo === 'item').length).toBe(4);
    expect(armarBloques(larga.slice(0, 3), new Set(), AHORA).some((b) => b.tipo === 'grupo')).toBeFalse();
  });

  it('cada tipo de actividad tiene su ícono y su color', () => {
    expect(iconoActividad({ id: 1, fechaRegistro: '', tipoActividad: 5, accion: '', tipo: 'comentario' })).toEqual({ icono: 'ti-message-circle', tono: 'comentario' });
    expect(iconoActividad({ id: 1, fechaRegistro: '', tipoActividad: 11, accion: '', tipo: 'shout' }).tono).toBe('reaccion');
    expect(iconoActividad({ id: 1, fechaRegistro: '', tipoActividad: 15, accion: '', tipo: 'comunidad' }).tono).toBe('comunidad');
    expect(iconoActividad({ id: 1, fechaRegistro: '', tipoActividad: 18, accion: '', tipo: 'rango' }).icono).toBe('ti-award');
  });
});

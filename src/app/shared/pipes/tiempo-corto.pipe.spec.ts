import { tiempoCorto } from './tiempo-corto.pipe';

describe('tiempoCorto', () => {
  const ahora = new Date(2026, 10, 1, 12, 0, 0).getTime();
  const hace = (segundos: number) => ahora - segundos * 1000;

  it('usa minutos, horas y días cuando es reciente', () => {
    expect(tiempoCorto(hace(20), ahora)).toBe('ahora');
    expect(tiempoCorto(hace(5 * 60), ahora)).toBe('5 min');
    expect(tiempoCorto(hace(2 * 3600 + 59), ahora)).toBe('2 h');
    expect(tiempoCorto(hace(3 * 86400), ahora)).toBe('3 d');
  });

  it('desde la semana muestra día y mes, y el año si no es el actual', () => {
    expect(tiempoCorto(new Date(2026, 9, 9, 7, 0), ahora)).toBe('9 oct');
    expect(tiempoCorto(new Date(2025, 5, 11), ahora)).toBe('11 jun 2025');
  });

  it('no falla con valores vacíos o inválidos', () => {
    expect(tiempoCorto(null, ahora)).toBe('');
    expect(tiempoCorto('no-es-fecha', ahora)).toBe('');
  });
});

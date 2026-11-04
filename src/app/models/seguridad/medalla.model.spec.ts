import { periodoMedalla } from './medalla.model';

describe('periodoMedalla', () => {
  const fecha = '2026-11-04T15:00:00Z';

  it('muestra el período como en Taringa!', () => {
    expect(periodoMedalla({ periodo: 'anio', periodoInicio: '2007-01-01T00:00:00', fecha })).toBe('Año 2007');
    expect(periodoMedalla({ periodo: 'mes', periodoInicio: '2008-09-01T00:00:00', fecha })).toBe('Septiembre de 2008');
    // La semana se nombra por su domingo (empieza el lunes 8).
    expect(periodoMedalla({ periodo: 'semana', periodoInicio: '2008-09-08T00:00:00', fecha })).toBe('14 de Septiembre de 2008');
    expect(periodoMedalla({ periodo: 'dia', periodoInicio: '2011-01-27T00:00:00', fecha })).toBe('27 de Enero de 2011');
  });

  it('sin período usa la fecha en que se otorgó', () => {
    expect(periodoMedalla({ periodo: null, periodoInicio: null, fecha })).toBe('4 de Noviembre de 2026');
  });
});

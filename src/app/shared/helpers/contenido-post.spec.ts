import { indiceDeContenido, minutosDeLectura, slugTitulo } from './contenido-post';

describe('contenido-post', () => {
  it('minutos de lectura: mínimo 1 y ~200 palabras por minuto', () => {
    expect(minutosDeLectura('')).toBe(1);
    expect(minutosDeLectura(`<p>${'palabra '.repeat(1000)}</p>`)).toBe(5);
  });

  it('slug sin tildes ni símbolos', () => {
    expect(slugTitulo('Paso 1: Instalación de Docker')).toBe('paso-1-instalacion-de-docker');
    expect(slugTitulo('¿¡!?')).toBe('seccion');
  });

  it('índice con H2/H3 en orden e ids únicos', () => {
    const indice = indiceDeContenido('<h2>Intro</h2><p>x</p><h3>Paso <b>uno</b></h3><h2>Intro</h2><h4>no</h4>');
    expect(indice).toEqual([
      { id: 't-intro', texto: 'Intro', nivel: 2 },
      { id: 't-paso-uno', texto: 'Paso uno', nivel: 3 },
      { id: 't-intro-2', texto: 'Intro', nivel: 2 },
    ]);
  });
});

import { AnuncioPublico, anuncioAplica, elegirPorPeso, partirContenido, Visitante } from './anuncios';

const anuncio = (cambios: Partial<AnuncioPublico> = {}): AnuncioPublico => ({
  id: 1,
  tipo: 'html',
  html: '<b>x</b>',
  ubicaciones: ['post-abajo'],
  categoriaIds: [],
  categoriaSeos: [],
  comunidadIds: [],
  dispositivo: 'todos',
  audiencia: 'todos',
  peso: 1,
  ...cambios,
});

const escritorio: Visitante = { movil: false, conSesion: false };

describe('anuncioAplica', () => {
  it('sin segmentación sale en cualquier página de su ubicación, y solo ahí', () => {
    expect(anuncioAplica(anuncio(), 'post-abajo', {}, escritorio)).toBeTrue();
    expect(anuncioAplica(anuncio(), 'post-arriba', {}, escritorio)).toBeFalse();
  });

  it('con categorías: por id (post) o por seo (listado), nunca en páginas sin categoría', () => {
    const a = anuncio({ categoriaIds: [7], categoriaSeos: ['juegos'] });
    expect(anuncioAplica(a, 'post-abajo', { categoriaId: 7 }, escritorio)).toBeTrue();
    expect(anuncioAplica(a, 'post-abajo', { categoriaSeo: 'juegos' }, escritorio)).toBeTrue();
    expect(anuncioAplica(a, 'post-abajo', { categoriaId: 8 }, escritorio)).toBeFalse();
    expect(anuncioAplica(a, 'post-abajo', {}, escritorio)).toBeFalse();
  });

  it('con comunidades: solo en esa comunidad y sus temas', () => {
    const a = anuncio({ ubicaciones: ['tema-abajo'], comunidadIds: [3] });
    expect(anuncioAplica(a, 'tema-abajo', { comunidadId: 3 }, escritorio)).toBeTrue();
    expect(anuncioAplica(a, 'tema-abajo', { comunidadId: 4 }, escritorio)).toBeFalse();
  });

  it('respeta dispositivo y sesión', () => {
    expect(anuncioAplica(anuncio({ dispositivo: 'movil' }), 'post-abajo', {}, escritorio)).toBeFalse();
    expect(anuncioAplica(anuncio({ dispositivo: 'movil' }), 'post-abajo', {}, { movil: true, conSesion: false })).toBeTrue();
    expect(anuncioAplica(anuncio({ audiencia: 'registrados' }), 'post-abajo', {}, escritorio)).toBeFalse();
    expect(anuncioAplica(anuncio({ audiencia: 'anonimos' }), 'post-abajo', {}, { movil: false, conSesion: true })).toBeFalse();
  });
});

describe('elegirPorPeso', () => {
  it('reparte según el peso', () => {
    const uno = anuncio({ id: 1, peso: 1 });
    const tres = anuncio({ id: 2, peso: 3 });
    // Total 4: [0, 1) es el primero, [1, 4) el segundo.
    expect(elegirPorPeso([uno, tres], () => 0.2)?.id).toBe(1);
    expect(elegirPorPeso([uno, tres], () => 0.3)?.id).toBe(2);
    expect(elegirPorPeso([uno, tres], () => 0.99)?.id).toBe(2);
  });

  it('sin candidatos no elige nada', () => {
    expect(elegirPorPeso([])).toBeNull();
  });
});

describe('partirContenido', () => {
  const p = (n: number) => `<p>Párrafo ${n}</p>`;

  it('parte después del tercer párrafo del primer nivel', () => {
    const partes = partirContenido(p(1) + '<blockquote><p>cita</p></blockquote>' + p(2) + p(3) + '<h2>Título</h2>' + p(4));

    expect(partes).not.toBeNull();
    expect(partes![0]).toContain('Párrafo 3');
    expect(partes![0]).toContain('<blockquote>');
    expect(partes![1].startsWith('<h2>Título</h2>')).toBeTrue();
  });

  it('no parte si el anuncio quedaría al final o no hay suficientes párrafos', () => {
    expect(partirContenido(p(1) + p(2) + p(3) + p(4))).toBeNull(); // queda un solo bloque después
    expect(partirContenido(p(1) + p(2))).toBeNull();
    expect(partirContenido('')).toBeNull();
  });
});

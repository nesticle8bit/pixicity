import { imagenesEnTexto, soloUrlsDeImagen } from './imagenes-en-texto';

describe('imagenesEnTexto', () => {
  it('encuentra URLs de imagen dentro del texto, con o sin query', () => {
    expect(imagenesEnTexto('mira esto https://i.imgur.com/abc.png y esto https://x.com/f.JPG?w=200&amp;h=1')).toEqual([
      'https://i.imgur.com/abc.png',
      'https://x.com/f.JPG?w=200&h=1',
    ]);
  });

  it('ignora enlaces que no son imágenes y no repite', () => {
    expect(imagenesEnTexto('https://example.com/pagina https://a.com/x.gif https://a.com/x.gif')).toEqual(['https://a.com/x.gif']);
    expect(imagenesEnTexto('https://example.com/foto.png.html')).toEqual([]);
  });

  it('corta en la puntuación final y en las etiquetas HTML', () => {
    expect(imagenesEnTexto('¿ves https://a.com/x.webp?<br>y https://b.com/y.jpeg.')).toEqual(['https://a.com/x.webp', 'https://b.com/y.jpeg']);
    expect(imagenesEnTexto('<a href="https://a.com/x.png">https://a.com/x.png</a>')).toEqual(['https://a.com/x.png']);
  });

  it('respeta el máximo', () => {
    const texto = [1, 2, 3, 4, 5, 6].map((n) => `https://a.com/${n}.png`).join(' ');
    expect(imagenesEnTexto(texto).length).toBe(4);
  });
});

describe('soloUrlsDeImagen', () => {
  it('es verdadero si el mensaje es solo la URL (también como enlace o con saltos)', () => {
    expect(soloUrlsDeImagen('https://a.com/x.png', ['https://a.com/x.png'])).toBeTrue();
    expect(soloUrlsDeImagen('<a href="https://a.com/x.png">https://a.com/x.png</a><br>', ['https://a.com/x.png'])).toBeTrue();
  });

  it('es falso si hay más texto', () => {
    expect(soloUrlsDeImagen('mira https://a.com/x.png', ['https://a.com/x.png'])).toBeFalse();
    expect(soloUrlsDeImagen('hola', [])).toBeFalse();
  });
});

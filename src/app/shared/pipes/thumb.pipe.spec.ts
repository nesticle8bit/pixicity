import { environment } from 'src/environments/environment';
import { thumbUrl } from './thumb.pipe';

describe('thumbUrl', () => {
  it('pide el doble del tamaño mostrado, redondeado al ancho disponible', () => {
    expect(thumbUrl('/images/fotos/ana/a.jpg', 48)).toBe('/images/_t/128/fotos/ana/a.jpg');
    expect(thumbUrl('/images/fotos/ana/a.jpg', 30)).toBe('/images/_t/64/fotos/ana/a.jpg');
    expect(thumbUrl('/images/fotos/ana/a.jpg', 280)).toBe('/images/_t/640/fotos/ana/a.jpg');
    // más grande que el máximo: el máximo
    expect(thumbUrl('/images/fotos/ana/a.jpg', 2000)).toBe('/images/_t/640/fotos/ana/a.jpg');
  });

  it('respeta el origen del API y el dominio público', () => {
    expect(thumbUrl(`${environment.api}/images/avatars/ana/x.jpeg`, 40)).toBe(`${environment.api}/images/_t/128/avatars/ana/x.jpeg`);
    expect(thumbUrl(`${environment.publicUrl}/images/fotos/ana/a.png`, 40)).toBe(`${environment.publicUrl}/images/_t/128/fotos/ana/a.png`);
  });

  it('no toca imágenes externas, assets, gifs ni miniaturas ya convertidas', () => {
    for (const url of [
      'https://i.imgur.com/x.png',
      'https://otro.com/images/a.jpg',
      '/assets/images/avatar.png',
      '/images/fotos/ana/animado.gif',
      '/images/_t/128/fotos/ana/a.jpg',
      '',
    ]) {
      expect(thumbUrl(url, 64)).toBe(url);
    }
    expect(thumbUrl(null, 64)).toBe('');
  });
});

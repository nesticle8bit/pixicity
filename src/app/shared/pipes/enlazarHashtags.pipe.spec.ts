import { enlazarHashtagsHtml, enlazarHashtagsTexto } from './enlazarHashtags.pipe';

describe('enlazarHashtags', () => {
  it('enlaza #tags de texto plano (con acentos) en minúsculas', () => {
    expect(enlazarHashtagsTexto('Hola #Fútbol!')).toBe('Hola <a class="te-tag" href="/hashtag/f%C3%BAtbol">#Fútbol</a>!');
  });

  it('no toma entidades HTML, anclas de URL ni "#" sueltos o de una letra', () => {
    const texto = 'it&#39;s https://x.com/#seccion # #a color#fff';
    expect(enlazarHashtagsTexto(texto)).toBe(texto);
  });

  it('en HTML solo toca nodos de texto, no atributos ni enlaces existentes', () => {
    const html = '<p style="color:#ffffff">Mira #rock</p><a href="#arriba">#arriba</a><code>#include</code>';
    expect(enlazarHashtagsHtml(html)).toBe(
      '<p style="color:#ffffff">Mira <a class="te-tag" href="/hashtag/rock">#rock</a></p><a href="#arriba">#arriba</a><code>#include</code>',
    );
  });
});

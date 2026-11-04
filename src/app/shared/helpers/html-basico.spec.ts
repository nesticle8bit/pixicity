import { htmlBasico } from './html-basico';
import { tiempoRestante } from 'src/app/components/shared/shouts/shout-encuesta/shout-encuesta.component';

describe('htmlBasico', () => {
  it('deja las etiquetas de formato sin atributos', () => {
    expect(htmlBasico('<b>a</b> <I>b</I> <u>c</u><br/>')).toBe('<b>a</b> <i>b</i> <u>c</u><br>');
  });

  it('escapa lo que no es formato básico o trae atributos', () => {
    const html = htmlBasico('<script>x()</script><b onclick="x()">y</b><img src=x onerror=x()><div>z</div>');

    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<div');
    expect(html).toContain('&lt;b onclick=');
  });

  it('rearma los enlaces https y descarta javascript:', () => {
    expect(htmlBasico('<a href="https://x.com/a">web</a>'))
      .toBe('<a href="https://x.com/a" target="_blank" rel="nofollow noopener">web</a>');
    expect(htmlBasico('<a href="javascript:alert(1)">x</a>')).not.toContain('<a ');
    expect(htmlBasico('<a href="https://x.com" onclick="y()">x</a>')).not.toContain('<a ');
  });

  it('decodifica una vez lo que codificó el sanitizador del API', () => {
    expect(htmlBasico('a &amp; b &lt;3')).toBe('a &amp; b &lt;3');
    expect(htmlBasico('&lt;b&gt;no&lt;/b&gt;')).toBe('<b>no</b>');
  });
});

describe('tiempoRestante', () => {
  const ahora = Date.parse('2026-11-04T12:00:00Z');

  it('muestra días, horas o minutos', () => {
    expect(tiempoRestante('2026-11-06T12:00:00Z', ahora)).toBe('Quedan 2 días');
    expect(tiempoRestante('2026-11-05T12:00:00Z', ahora)).toBe('Quedan 1 día');
    expect(tiempoRestante('2026-11-04T15:30:00Z', ahora)).toBe('Quedan 3 h');
    expect(tiempoRestante('2026-11-04T12:04:10Z', ahora)).toBe('Quedan 5 min');
  });
});

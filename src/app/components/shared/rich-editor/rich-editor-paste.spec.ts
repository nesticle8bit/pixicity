import { cleanPastedHtml, plainTextFragment } from './rich-editor-paste';

function clean(markup: string): string {
  const div = document.createElement('div');
  div.appendChild(cleanPastedHtml(markup));
  return div.innerHTML;
}

describe('rich-editor-paste', () => {
  it('descarta scripts, estilos, metadatos y atributos', () => {
    const out = clean(
      '<meta charset="utf-8"><style>p{color:red}</style><script>alert(1)</script>'
      + '<p class="MsoNormal" style="font-family:Calibri" onclick="x()">Hola</p>',
    );
    expect(out).toBe('<p>Hola</p>');
  });

  it('convierte el formato por estilos de Google Docs en tags', () => {
    const out = clean(
      '<b style="font-weight:normal;" id="docs-internal-guid-123"><p dir="ltr">'
      + '<span style="font-weight:700">negrita</span> y <span style="font-style:italic">cursiva</span>'
      + '</p></b>',
    );
    expect(out).toBe('<p><strong>negrita</strong> y <em>cursiva</em></p>');
  });

  it('normaliza tags equivalentes y conserva la alineación', () => {
    expect(clean('<div align="center"><b>a</b><i>b</i><strike>c</strike></div>'))
      .toBe('<p style="text-align: center;"><strong>a</strong><em>b</em><s>c</s></p>');
  });

  it('enlaces: solo esquemas seguros, siempre en pestaña nueva', () => {
    expect(clean('<a href="javascript:alert(1)">x</a>')).toBe('x');
    expect(clean('<a href="https://pixicity.com" style="color:red">y</a>'))
      .toBe('<a href="https://pixicity.com" target="_blank" rel="noopener noreferrer">y</a>');
  });

  it('imágenes: http(s) o rutas relativas, envueltas como redimensionables', () => {
    expect(clean('<img src="data:image/png;base64,AAA">')).toBe('');
    expect(clean('<img src="https://x.com/a.png" alt="a">'))
      .toBe('<span class="img-resizable" contenteditable="false"><img src="https://x.com/a.png" alt="a"></span>');
  });

  it('no anida párrafos dentro de ítems de lista y conserva listas anidadas', () => {
    expect(clean('<ul><li><p>uno</p></li><li>dos<ul><li>tres</li></ul></li></ul>'))
      .toBe('<ul><li>uno</li><li>dos<ul><li>tres</li></ul></li></ul>');
  });

  it('un div que envuelve bloques no genera un párrafo extra', () => {
    expect(clean('<div><p>a</p><p>b</p></div>')).toBe('<p>a</p><p>b</p>');
  });

  it('texto plano: una línea queda inline, varias son párrafos', () => {
    const one = document.createElement('div');
    one.appendChild(plainTextFragment('hola'));
    expect(one.innerHTML).toBe('hola');

    const many = document.createElement('div');
    many.appendChild(plainTextFragment('uno\r\n\r\ndos\n'));
    expect(many.innerHTML).toBe('<p>uno</p><p><br></p><p>dos</p>');
  });
});

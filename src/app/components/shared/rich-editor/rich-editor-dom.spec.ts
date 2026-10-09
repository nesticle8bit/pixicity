import {
  CARET_GUARD,
  isolate,
  normalizeInline,
  rangeFromOffsets,
  serializeHtml,
  textOffset,
} from './rich-editor-dom';

function html(markup: string): HTMLDivElement {
  const div = document.createElement('div');
  div.innerHTML = markup;
  return div;
}

describe('rich-editor-dom', () => {
  describe('offsets de texto', () => {
    it('ida y vuelta entre offset y posición', () => {
      const root = html('<p>ab<strong>cd</strong>ef</p>');
      const range = rangeFromOffsets(root, 1, 5);
      expect(range.toString()).toBe('bcde');
      expect(textOffset(root, range.startContainer, range.startOffset)).toBe(1);
      expect(textOffset(root, range.endContainer, range.endOffset)).toBe(5);
    });

    it('el inicio en un límite cae dentro del nodo siguiente', () => {
      const root = html('<p>ab<strong>cd</strong></p>');
      const range = rangeFromOffsets(root, 2, 4);
      expect(range.startContainer.parentElement?.tagName).toBe('STRONG');
    });
  });

  describe('isolate', () => {
    it('divide el elemento dejando solo la parte seleccionada', () => {
      const root = html('<p><strong>hola mundo feliz</strong></p>');
      const strong = root.querySelector('strong')!;
      const mid = isolate(strong, rangeFromOffsets(root, 5, 10));
      expect(mid.textContent).toBe('mundo');
      expect(root.innerHTML).toBe('<p><strong>hola </strong><strong>mundo</strong><strong> feliz</strong></p>');
    });

    it('no deja clones vacíos en los bordes', () => {
      const root = html('<p><em>todo</em></p>');
      isolate(root.querySelector('em')!, rangeFromOffsets(root, 0, 4));
      expect(root.innerHTML).toBe('<p><em>todo</em></p>');
    });
  });

  describe('normalizeInline', () => {
    it('fusiona hermanos iguales y quita inlines vacíos', () => {
      const root = html('<p><strong>a</strong><strong>b</strong><em></em>c</p>');
      normalizeInline(root);
      expect(root.innerHTML).toBe('<p><strong>ab</strong>c</p>');
    });

    it('quita marcas redundantes anidadas y spans sin atributos', () => {
      const root = html('<p><strong>a<b>b</b></strong><span>c</span><span style="">d</span></p>');
      normalizeInline(root);
      expect(root.innerHTML).toBe('<p><strong>ab</strong>cd</p>');
    });

    it('no fusiona spans con clase ni imágenes', () => {
      const markup = '<p><span class="img-resizable" contenteditable="false"><img src="/a.jpg"></span>'
        + '<span class="img-resizable" contenteditable="false"><img src="/b.jpg"></span></p>';
      const root = html(markup);
      normalizeInline(root);
      expect(root.querySelectorAll('.img-resizable').length).toBe(2);
    });
  });

  describe('serializeHtml', () => {
    it('un editor sin contenido vale cadena vacía', () => {
      expect(serializeHtml(html('<p><br></p>'))).toBe('');
      expect(serializeHtml(html('<p>  </p><p></p>'))).toBe('');
    });

    it('una imagen sola sí es contenido', () => {
      expect(serializeHtml(html('<p><img src="/a.jpg"></p>'))).toContain('<img');
    });

    it('quita caracteres guía y placeholders de subida', () => {
      const root = html(`<p>a<code>b</code>${CARET_GUARD}<span class="rich-editor__uploading">Subiendo</span></p>`);
      expect(serializeHtml(root)).toBe('<p>a<code>b</code></p>');
      // el DOM del editor no se toca
      expect(root.querySelector('.rich-editor__uploading')).not.toBeNull();
    });
  });
});

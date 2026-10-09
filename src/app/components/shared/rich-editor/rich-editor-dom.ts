// Utilidades DOM puras del editor (sin estado de Angular), testeables por separado.

export const BLOCK_TAGS = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI', 'PRE'];

// Tags de formato inline que se pueden fusionar, limpiar o quitar con "Eliminar formato"
export const INLINE_FORMAT_TAGS = ['STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE', 'DEL', 'CODE', 'SPAN', 'A'];

// Tags equivalentes (una <b> dentro de <strong> es redundante)
const MARK_FAMILIES = [['STRONG', 'B'], ['EM', 'I'], ['U'], ['S', 'STRIKE', 'DEL'], ['CODE']];

// Caracter invisible que deja el caret fuera de un inline recién creado; nunca se guarda
export const CARET_GUARD = '​';

export const isElement = (node: Node | null): node is HTMLElement => node instanceof HTMLElement;

export function isBlock(node: Node | null): boolean {
  return isElement(node) && BLOCK_TAGS.includes(node.tagName);
}

// Elementos no editables (imágenes redimensionables, placeholders de subida)
export function isAtomic(el: HTMLElement): boolean {
  return el.getAttribute('contenteditable') === 'false';
}

// Sin texto visible ni contenido "duro" (imágenes, líneas, embeds)
export function isVisuallyEmpty(el: Node): boolean {
  const text = (el.textContent || '').replace(new RegExp(CARET_GUARD, 'g'), '').trim();
  if (text) return false;
  return !(isElement(el) && el.querySelector('img, hr, iframe, [contenteditable="false"]'));
}

export function emptyParagraph(): HTMLParagraphElement {
  const p = document.createElement('p');
  p.appendChild(document.createElement('br'));
  return p;
}

// Quita un elemento dejando su contenido en su lugar
export function unwrapNode(el: HTMLElement): void {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  el.remove();
}

export function closestWithin(node: Node | null, root: Node, match: (el: HTMLElement) => boolean): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== root) {
    if (isElement(current) && match(current)) return current;
    current = current.parentNode;
  }
  return null;
}

//  Posiciones como offsets de texto
//  Los Range "vivos" se colapsan cuando sus nodos se mueven; los offsets de texto
//  sobreviven a cualquier reestructuración que no cambie el texto.

export function textOffset(root: Node, node: Node, offset: number): number {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(node, offset);
  return range.toString().length;
}

// `forward`: en el límite entre dos nodos de texto, prefiere el siguiente
// (para el inicio de una selección) en vez del anterior (para el final).
export function pointAt(root: Node, target: number, forward = false): { node: Node; offset: number } {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let acc = 0;
  let last: Text | null = null;
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    const end = acc + n.data.length;
    if (forward ? end > target : end >= target) return { node: n, offset: Math.max(0, target - acc) };
    acc = end;
    last = n;
  }
  return last ? { node: last, offset: last.data.length } : { node: root, offset: root.childNodes.length };
}

export function rangeFromOffsets(root: Node, start: number, end: number): Range {
  const range = document.createRange();
  const s = pointAt(root, start, start !== end);
  const e = start === end ? s : pointAt(root, end);
  range.setStart(s.node, s.offset);
  range.setEnd(e.node, e.offset);
  return range;
}

// Divide `el` en los bordes del rango: `el` queda solo con la parte seleccionada
// y lo anterior/posterior pasa a clones hermanos.
export function isolate(el: HTMLElement, range: Range): HTMLElement {
  const tail = document.createRange();
  tail.setStart(range.endContainer, range.endOffset);
  tail.setEnd(el, el.childNodes.length);
  const right = el.cloneNode(false) as HTMLElement;
  right.appendChild(tail.extractContents());
  el.after(right);

  const head = document.createRange();
  head.setStart(el, 0);
  head.setEnd(range.startContainer, range.startOffset);
  const left = el.cloneNode(false) as HTMLElement;
  left.appendChild(head.extractContents());
  el.before(left);

  if (isVisuallyEmpty(left) && !left.querySelector('br')) left.remove();
  if (isVisuallyEmpty(right) && !right.querySelector('br')) right.remove();
  return el;
}

// Hermanos fusionables: mismo tag y mismos atributos (sin clases ni nodos atómicos)
function canMerge(a: HTMLElement, b: HTMLElement): boolean {
  if (a.tagName !== b.tagName || a.hasAttribute('class') || isAtomic(a)) return false;
  if (a.attributes.length !== b.attributes.length) return false;
  return Array.from(a.attributes).every((attr) => b.getAttribute(attr.name) === attr.value);
}

function sameFamily(tag: string): string[] | undefined {
  return MARK_FAMILIES.find((f) => f.includes(tag));
}

// Limpia el formato inline tras una edición: spans/estilos vacíos, marcas
// anidadas redundantes, inlines vacíos y hermanos iguales separados.
export function normalizeInline(root: HTMLElement): void {
  const selector = INLINE_FORMAT_TAGS.join(',');

  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    if (!root.contains(el) || isAtomic(el) || el.hasAttribute('class')) return;
    if (el.getAttribute('style') !== null && el.style.length === 0) el.removeAttribute('style');

    if (isVisuallyEmpty(el) && !el.querySelector('br')) {
      unwrapNode(el); // conserva un posible CARET_GUARD
      return;
    }
    if (el.tagName === 'SPAN' && el.attributes.length === 0) {
      unwrapNode(el);
      return;
    }
    const family = sameFamily(el.tagName);
    const parent = el.parentElement;
    if (family && parent && closestWithin(parent, root, (p) => family.includes(p.tagName))) {
      unwrapNode(el);
    }
  });

  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    let next = el.nextSibling;
    while (root.contains(el) && isElement(next) && canMerge(el, next)) {
      while (next.firstChild) el.appendChild(next.firstChild);
      next.remove();
      next = el.nextSibling;
    }
  });

  root.normalize();
}

// HTML a guardar: sin caracteres guía ni placeholders de subida
export function serializeHtml(editor: HTMLElement): string {
  let source = editor;
  if (editor.querySelector('.rich-editor__uploading')) {
    source = editor.cloneNode(true) as HTMLElement;
    source.querySelectorAll('.rich-editor__uploading').forEach((n) => n.remove());
  }
  if (isVisuallyEmpty(source)) return '';
  return source.innerHTML.replace(new RegExp(CARET_GUARD, 'g'), '');
}

// Limpieza del contenido pegado/arrastrado: deja solo la estructura y el formato
// que el editor sabe manejar. Word, Google Docs y las páginas web traen estilos,
// clases, fuentes y metadatos que no deben terminar en el post.

import { BLOCK_TAGS } from './rich-editor-dom';

// Se descartan junto con todo su contenido
const DROP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'HEAD', 'NOSCRIPT', 'TEMPLATE', 'IFRAME', 'OBJECT',
  'EMBED', 'SVG', 'CANVAS', 'VIDEO', 'AUDIO', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'FORM',
]);

// Tag de origen -> tag resultante
const TAG_MAP: Record<string, string> = {
  P: 'p', DIV: 'p', TR: 'p', DT: 'p', DD: 'p', SECTION: 'p', ARTICLE: 'p',
  H1: 'h1', H2: 'h2', H3: 'h3', H4: 'h4', H5: 'h5', H6: 'h6',
  BLOCKQUOTE: 'blockquote', PRE: 'pre', UL: 'ul', OL: 'ol', LI: 'li',
  STRONG: 'strong', B: 'strong', EM: 'em', I: 'em', U: 'u', S: 's', STRIKE: 's', DEL: 's',
  CODE: 'code', KBD: 'code', A: 'a', BR: 'br', HR: 'hr', IMG: 'img',
};

// Contenedores dentro de los que un bloque pegado se aplana (no se anidan <p> en <li>)
const FLAT_CONTAINERS = ['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE'];

const ALIGNS = ['center', 'right', 'justify'];

function isBlockTag(tag: string | undefined): boolean {
  return !!tag && (BLOCK_TAGS.includes(tag.toUpperCase()) || tag === 'ul' || tag === 'ol');
}

export function isSafeHref(href: string): boolean {
  return /^(https?:|mailto:)/i.test(href) || /^[/#]/.test(href);
}

function isSafeImageSrc(src: string): boolean {
  return /^https?:/i.test(src) || (src.startsWith('/') && !src.startsWith('//'));
}

// Marcas que Google Docs y otros expresan con estilos en vez de tags
function marksFromStyle(el: HTMLElement): string[] {
  const s = el.style;
  const marks: string[] = [];
  const weight = s.fontWeight;
  if (weight === 'bold' || weight === 'bolder' || Number(weight) >= 600) marks.push('strong');
  if (s.fontStyle === 'italic') marks.push('em');
  const deco = `${s.textDecoration} ${s.textDecorationLine}`;
  if (deco.includes('underline')) marks.push('u');
  if (deco.includes('line-through')) marks.push('s');
  return marks;
}

function buildElement(source: HTMLElement, tag: string): HTMLElement | null {
  const el = document.createElement(tag);

  if (tag === 'a') {
    const href = (source.getAttribute('href') || '').trim();
    if (!href || !isSafeHref(href)) return null; // se desenvuelve: queda el texto
    el.setAttribute('href', href);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  }

  const align = (source.style.textAlign || source.getAttribute('align') || '').toLowerCase();
  if (BLOCK_TAGS.includes(tag.toUpperCase()) && ALIGNS.includes(align)) el.style.textAlign = align;

  return el;
}

export function imageNode(src: string, alt = ''): HTMLElement {
  const img = document.createElement('img');
  img.src = src;
  if (alt) img.alt = alt;
  // Envoltura redimensionable (la imagen no es editable, el span lleva el handle)
  const wrap = document.createElement('span');
  wrap.className = 'img-resizable';
  wrap.setAttribute('contenteditable', 'false');
  wrap.appendChild(img);
  return wrap;
}

function convertChildren(source: Node, out: Node, inPre: boolean): void {
  source.childNodes.forEach((child) => convertNode(child, out, inPre));
}

function convertNode(node: Node, out: Node, inPre: boolean): void {
  if (node.nodeType === Node.TEXT_NODE) {
    let text = (node as Text).data;
    if (!inPre) {
      // Espacios de indentación del HTML de origen entre bloques
      if (/^\s*$/.test(text) && text.includes('\n')) return;
      text = text.replace(/[\s ]+/g, (m) => (m.includes(' ') && m.length === 1 ? ' ' : ' '));
    }
    if (text) out.appendChild(document.createTextNode(text));
    return;
  }
  if (!(node instanceof Element)) return; // comentarios, etc.

  const source = node as HTMLElement;
  const name = source.tagName.toUpperCase();
  if (DROP_TAGS.has(name)) return;

  // Contenedor invisible de Google Docs: <b style="font-weight:normal" id="docs-internal-guid-…">
  if (name === 'B' && (source.style.fontWeight === 'normal' || /^docs-internal/.test(source.id))) {
    convertChildren(source, out, inPre);
    return;
  }

  if (name === 'IMG') {
    const src = (source.getAttribute('src') || '').trim();
    if (isSafeImageSrc(src)) out.appendChild(imageNode(src, source.getAttribute('alt') || ''));
    return;
  }

  if (name === 'TD' || name === 'TH') {
    convertChildren(source, out, inPre);
    out.appendChild(document.createTextNode(' '));
    return;
  }

  const tag = TAG_MAP[name];

  // <span> o tag desconocido: se desenvuelve, conservando negrita/cursiva/etc. si vienen como estilo
  if (!tag) {
    let target: Node = out;
    for (const mark of marksFromStyle(source)) target = target.appendChild(document.createElement(mark));
    convertChildren(source, target, inPre);
    return;
  }

  // Un bloque dentro de otro que no admite bloques se aplana con un salto de línea
  const outTag = out instanceof HTMLElement ? out.tagName : '';
  const nestedList = outTag === 'LI' && (tag === 'ul' || tag === 'ol');
  if (isBlockTag(tag) && tag !== 'li' && !nestedList && FLAT_CONTAINERS.includes(outTag)) {
    if (out.childNodes.length) out.appendChild(document.createElement('br'));
    convertChildren(source, out, inPre);
    return;
  }

  // <div>/<section> que envuelve otros bloques: solo se conservan sus hijos
  if (tag === 'p' && name !== 'P' && Array.from(source.children).some((c) => isBlockTag(TAG_MAP[c.tagName.toUpperCase()]))) {
    convertChildren(source, out, inPre);
    return;
  }

  const el = buildElement(source, tag);
  if (!el) {
    convertChildren(source, out, inPre);
    return;
  }
  out.appendChild(el);
  if (tag === 'br' || tag === 'hr') return;
  convertChildren(source, el, inPre || tag === 'pre');
}

export function cleanPastedHtml(html: string): DocumentFragment {
  // DOMParser crea un documento inerte: no ejecuta scripts ni carga imágenes
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const frag = document.createDocumentFragment();
  convertChildren(parsed.body, frag, false);
  trimEdges(frag);
  return frag;
}

// Texto plano: una línea -> texto inline; varias -> un párrafo por línea
export function plainTextFragment(text: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const lines = text.replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n');
  if (lines.length === 1) {
    frag.appendChild(document.createTextNode(lines[0]));
    return frag;
  }
  for (const line of lines) {
    const p = document.createElement('p');
    p.appendChild(line ? document.createTextNode(line) : document.createElement('br'));
    frag.appendChild(p);
  }
  return frag;
}

// Quita espacios y <br> sueltos al principio/final del contenido pegado
function trimEdges(frag: DocumentFragment): void {
  const isJunk = (n: ChildNode | null) =>
    !!n && ((n.nodeType === Node.TEXT_NODE && !(n as Text).data.trim()) || (n instanceof HTMLElement && n.tagName === 'BR'));
  while (isJunk(frag.firstChild)) frag.firstChild!.remove();
  while (isJunk(frag.lastChild)) frag.lastChild!.remove();
}

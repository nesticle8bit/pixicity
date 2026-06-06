import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-rich-editor',
  templateUrl: './rich-editor.component.html',
  styleUrls: ['./rich-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichEditorComponent),
      multi: true,
    },
  ],
})
export class RichEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() placeholder: string = 'Escribe aquí...';
  @ViewChild('editorEl') editorEl!: ElementRef<HTMLDivElement>;

  showHeadingMenu = false;
  showColorPicker = false;

  //  Bubble menu (Notion-style) que aparece al seleccionar texto
  @ViewChild('wrapperEl') wrapperEl!: ElementRef<HTMLDivElement>;
  @ViewChild('bubbleEl') bubbleEl!: ElementRef<HTMLDivElement>;
  @ViewChild('linkInputEl') linkInputEl!: ElementRef<HTMLInputElement>;

  showBubble = false;
  showBubbleColors = false;
  showLinkInput = false;
  bubbleTop = 0;
  bubbleLeft = 0;
  linkUrl = '';
  private savedRange: Range | null = null;

  readonly headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  readonly colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#ffffff',
    '#ff0000', '#ff4500', '#ff8c00', '#ffd700', '#adff2f', '#008000', '#00ced1', '#0000ff',
    '#8b008b', '#ff1493', '#ff69b4', '#a52a2a', '#d2691e', '#f4a460', '#deb887', '#2e8b57',
  ];

  private static readonly BLOCK_TAGS = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI', 'PRE'];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private pendingValue = '';
  private initialized = false;

  // Historial propio (reemplaza execCommand undo/redo)
  private history: string[] = [];
  private historyIndex = -1;
  private snapshotTimer: any = null;

  constructor(private host: ElementRef<HTMLElement>) {}

  private get editor(): HTMLDivElement {
    return this.editorEl.nativeElement;
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    if (this.pendingValue) {
      this.editor.innerHTML = this.pendingValue;
    }
    this.resetHistory();
  }

  ngOnDestroy(): void {
    clearTimeout(this.snapshotTimer);
  }

  // ControlValueAccessor
  writeValue(value: string): void {
    const html = value || '';
    if (this.initialized && this.editorEl) {
      this.editor.innerHTML = html;
      this.resetHistory();
    } else {
      this.pendingValue = html;
    }
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Input events
  onInput(): void {
    this.onChange(this.editor.innerHTML);
    clearTimeout(this.snapshotTimer);
    this.snapshotTimer = setTimeout(() => this.recordHistory(), 350);
  }

  onBlur(): void {
    this.onTouched();
  }

  // Atajos de teclado (sin execCommand nativo)
  onKeydown(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();

    if (key === 'z') {
      event.preventDefault();
      event.shiftKey ? this.redo() : this.undo();
      return;
    }
    if (key === 'y') {
      event.preventDefault();
      this.redo();
      return;
    }
    if (key === 'b') { event.preventDefault(); this.bold(); }
    else if (key === 'i') { event.preventDefault(); this.italic(); }
    else if (key === 'u') { event.preventDefault(); this.underline(); }
  }

  // Close dropdowns on outside click
  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('.rich-editor__dropdown')) {
      this.showHeadingMenu = false;
      this.showColorPicker = false;
    }
  }

  //  Comandos de la toolbar (Range/Selection, sin execCommand)

  bold(): void          { this.toggleInline(['STRONG', 'B'], 'strong'); }
  italic(): void        { this.toggleInline(['EM', 'I'], 'em'); }
  underline(): void     { this.toggleInline(['U'], 'u'); }
  strikeThrough(): void { this.toggleInline(['S', 'STRIKE', 'DEL'], 's'); }
  toggleCode(): void    { this.toggleInline(['CODE'], 'code'); }

  toggleBlockquote(): void {
    const blocks = this.selectedBlocks();
    const inQuote = blocks.some((b) => this.closestAnyTag(b, ['BLOCKQUOTE']));
    this.applyBlock(inQuote ? 'p' : 'blockquote');
  }

  orderedList(): void { this.toggleList('OL'); }
  bulletList(): void  { this.toggleList('UL'); }

  formatHeading(tag: string): void {
    this.applyBlock(tag);
    this.showHeadingMenu = false;
  }

  insertLink(): void {
    const url = (prompt('URL del enlace:') || '').trim();
    if (url) this.createLink(this.normalizeUrl(url));
  }

  insertImage(): void {
    const url = (prompt('URL de la imagen:') || '').trim();
    if (!url) return;
    const range = this.currentRange();
    const img = document.createElement('img');
    img.src = url;
    if (range) {
      range.collapse(false);
      range.insertNode(img);
    } else {
      this.editor.appendChild(img);
    }
    this.afterChange();
  }

  setColor(color: string): void {
    this.applyForeColor(color);
    this.showColorPicker = false;
  }

  alignLeft(): void    { this.applyAlign('left'); }
  alignCenter(): void  { this.applyAlign('center'); }
  alignRight(): void   { this.applyAlign('right'); }
  alignJustify(): void { this.applyAlign('justify'); }

  horizontalRule(): void {
    const range = this.currentRange();
    if (!range) return;
    const hr = document.createElement('hr');
    range.collapse(false);
    range.insertNode(hr);
    this.afterChange();
  }

  removeFormat(): void {
    const range = this.currentRange();
    if (!range || range.collapsed) return;
    const text = range.toString();
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    const r = document.createRange();
    r.selectNode(node);
    this.selectRange(r);
    this.afterChange();
  }

  undo(): void {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this.restoreHistory();
  }

  redo(): void {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    this.restoreHistory();
  }

  //  Bubble menu (Notion-style)

  @HostListener('document:selectionchange')
  onSelectionChange(): void {
    if (this.showLinkInput) return;
    this.updateBubble();
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange(): void {
    if (this.showBubble && !this.showLinkInput) this.updateBubble();
  }

  @HostListener('document:mousedown', ['$event.target'])
  onDocMouseDown(target: EventTarget | null): void {
    if (target instanceof Node && !this.host.nativeElement.contains(target)) {
      this.hideBubble();
    }
  }

  preventLoseSelection(event: Event): void {
    event.preventDefault();
  }

  toggleBubbleColors(): void {
    this.showBubbleColors = !this.showBubbleColors;
    this.showLinkInput = false;
  }

  applyColor(color: string): void {
    this.restoreSelection();
    this.applyForeColor(color);
    this.showBubbleColors = false;
    this.updateBubble();
  }

  openLink(): void {
    const selectedText = (this.savedRange?.toString() || '').trim();
    if (this.isUrl(selectedText)) {
      this.restoreSelection();
      this.createLink(this.normalizeUrl(selectedText));
      this.showLinkInput = false;
      this.updateBubble();
      return;
    }

    const existing = this.closestTag(this.savedRange?.commonAncestorContainer ?? null, 'A');
    this.linkUrl = existing ? (existing as HTMLAnchorElement).getAttribute('href') || '' : '';
    this.showLinkInput = true;
    this.showBubbleColors = false;
    setTimeout(() => this.linkInputEl?.nativeElement.focus(), 0);
  }

  applyLink(): void {
    const url = (this.linkInputEl?.nativeElement.value || '').trim();
    this.restoreSelection();
    if (url) this.createLink(this.normalizeUrl(url));
    this.showLinkInput = false;
    this.updateBubble();
  }

  removeLink(): void {
    this.restoreSelection();
    const range = this.currentRange();
    const a = this.closestTag(range?.commonAncestorContainer ?? null, 'A');
    if (a) {
      this.unwrap(a);
      this.afterChange();
    }
    this.showLinkInput = false;
    this.updateBubble();
  }

  isActive(command: string): boolean {
    const map: Record<string, string[]> = {
      bold: ['STRONG', 'B'],
      italic: ['EM', 'I'],
      underline: ['U'],
      strikeThrough: ['S', 'STRIKE', 'DEL'],
    };
    const tags = map[command];
    if (!tags) return false;
    const sel = window.getSelection();
    return !!this.closestAnyTag(sel?.anchorNode ?? null, tags);
  }

  //  Motor de edición (Range/Selection)

  private currentRange(): Range | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    return this.editor.contains(range.commonAncestorContainer) ? range : null;
  }

  private selectRange(range: Range): void {
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }

  private selectNodeContents(node: Node): void {
    const range = document.createRange();
    range.selectNodeContents(node);
    this.selectRange(range);
  }

  private afterChange(): void {
    this.editor.focus();
    this.onChange(this.editor.innerHTML);
    this.recordHistory();
  }

  // Toggle de formato inline envolviendo/desenvolviendo un tag
  private toggleInline(tags: string[], createTag: string): void {
    const range = this.currentRange();
    if (!range || range.collapsed) return;

    const existing = this.closestAnyTag(range.commonAncestorContainer, tags);
    if (existing) {
      this.unwrap(existing);
    } else {
      this.wrap(range, createTag);
    }
    this.afterChange();
  }

  private applyForeColor(color: string): void {
    const range = this.currentRange();
    if (!range || range.collapsed) return;
    this.wrap(range, 'span', (el) => (el.style.color = color));
    this.afterChange();
  }

  private createLink(url: string): void {
    const range = this.currentRange();
    if (!range || range.collapsed) return;
    this.wrap(range, 'a', (el) => {
      (el as HTMLAnchorElement).href = url;
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
    this.afterChange();
  }

  // Envuelve el contenido del rango en un nuevo elemento
  private wrap(range: Range, tag: string, apply?: (el: HTMLElement) => void): void {
    const el = document.createElement(tag);
    if (apply) apply(el);
    try {
      range.surroundContents(el);
    } catch {
      el.appendChild(range.extractContents());
      range.insertNode(el);
    }
    this.selectNodeContents(el);
  }

  // Quita un elemento dejando su contenido en su lugar
  private unwrap(el: HTMLElement): void {
    const parent = el.parentNode;
    if (!parent) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const frag = range.extractContents();
    const first = frag.firstChild;
    const last = frag.lastChild;
    parent.replaceChild(frag, el);
    if (first && last) {
      const r = document.createRange();
      r.setStartBefore(first);
      r.setEndAfter(last);
      this.selectRange(r);
    }
  }

  // Cambia el tag del/los bloque(s) seleccionado(s)
  private applyBlock(tag: string): void {
    const blocks = this.selectedBlocks();
    if (blocks.length === 0) {
      // No hay bloque: envuelve la selección en uno nuevo
      const range = this.currentRange();
      if (range && !range.collapsed) this.wrap(range, tag);
      this.afterChange();
      return;
    }
    blocks.forEach((b) => this.renameBlock(b, tag));
    this.afterChange();
  }

  private renameBlock(block: HTMLElement, tag: string): HTMLElement {
    if (block.tagName === tag.toUpperCase()) return block;
    const el = document.createElement(tag);
    if (block.style.textAlign) el.style.textAlign = block.style.textAlign;
    while (block.firstChild) el.appendChild(block.firstChild);
    block.replaceWith(el);
    return el;
  }

  private applyAlign(value: string): void {
    const blocks = this.selectedBlocks();
    if (blocks.length === 0) return;
    blocks.forEach((b) => (b.style.textAlign = value));
    this.afterChange();
  }

  private toggleList(listTag: 'UL' | 'OL'): void {
    const blocks = this.selectedBlocks();
    if (blocks.length === 0) return;

    const firstLi = this.closestAnyTag(blocks[0], ['LI']);
    const parentList = firstLi?.parentElement ?? null;

    if (parentList && parentList.tagName === listTag) {
      // Misma lista -> desenvolver a párrafos
      this.unwrapList(parentList);
    } else if (parentList && (parentList.tagName === 'UL' || parentList.tagName === 'OL')) {
      // Cambiar tipo de lista
      const newList = document.createElement(listTag);
      while (parentList.firstChild) newList.appendChild(parentList.firstChild);
      parentList.replaceWith(newList);
    } else {
      // Envolver bloques en una lista nueva
      const list = document.createElement(listTag);
      const first = blocks[0];
      first.parentNode?.insertBefore(list, first);
      blocks.forEach((b) => {
        const li = document.createElement('li');
        while (b.firstChild) li.appendChild(b.firstChild);
        list.appendChild(li);
        b.remove();
      });
    }
    this.afterChange();
  }

  private unwrapList(list: HTMLElement): void {
    const frag = document.createDocumentFragment();
    Array.from(list.children).forEach((li) => {
      const p = document.createElement('p');
      while (li.firstChild) p.appendChild(li.firstChild);
      frag.appendChild(p);
    });
    list.replaceWith(frag);
  }

  // Bloques que intersecta la selección (hojas, no contenedores)
  private selectedBlocks(): HTMLElement[] {
    const range = this.currentRange();
    if (!range) return [];

    const candidates = Array.from(
      this.editor.querySelectorAll(RichEditorComponent.BLOCK_TAGS.join(','))
    ) as HTMLElement[];

    let blocks = candidates.filter((el) => range.intersectsNode(el));

    if (blocks.length === 0) {
      const b = this.blockOf(range.startContainer);
      return b ? [b] : [];
    }
    // Solo hojas (los que no contienen a otro bloque seleccionado)
    return blocks.filter((b) => !blocks.some((o) => o !== b && b.contains(o)));
  }

  private blockOf(node: Node | null): HTMLElement | null {
    let cur: HTMLElement | null = node instanceof HTMLElement ? node : node?.parentElement ?? null;
    while (cur && cur !== this.editor) {
      if (RichEditorComponent.BLOCK_TAGS.includes(cur.tagName)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  //  Historial (snapshots de innerHTML)

  private resetHistory(): void {
    this.history = [this.editor.innerHTML];
    this.historyIndex = 0;
  }

  private recordHistory(): void {
    const html = this.editor.innerHTML;
    if (this.history[this.historyIndex] === html) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(html);
    if (this.history.length > 200) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  private restoreHistory(): void {
    this.editor.innerHTML = this.history[this.historyIndex] ?? '';
    this.onChange(this.editor.innerHTML);
    this.hideBubble();
    this.placeCaretEnd();
  }

  private placeCaretEnd(): void {
    const range = document.createRange();
    range.selectNodeContents(this.editor);
    range.collapse(false);
    this.selectRange(range);
    this.editor.focus();
  }

  //  Bubble: visibilidad / posición

  private updateBubble(): void {
    const sel = window.getSelection();
    const editor = this.editorEl?.nativeElement;

    if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !editor) {
      this.hideBubble();
      return;
    }

    const range = sel.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer) || !sel.toString().trim()) {
      this.hideBubble();
      return;
    }

    this.savedRange = range.cloneRange();

    const rect = range.getBoundingClientRect();
    const wrap = this.wrapperEl.nativeElement.getBoundingClientRect();
    const bubble = this.bubbleEl?.nativeElement;
    const bw = bubble?.offsetWidth || 280;
    const bh = bubble?.offsetHeight || 40;

    let top = rect.top - wrap.top - bh - 8;
    if (top < 0) top = rect.bottom - wrap.top + 8;

    let left = rect.left - wrap.left + rect.width / 2 - bw / 2;
    left = Math.max(4, Math.min(left, wrap.width - bw - 4));

    this.bubbleTop = top;
    this.bubbleLeft = left;
    this.showBubble = true;
  }

  private hideBubble(): void {
    this.showBubble = false;
    this.showBubbleColors = false;
    this.showLinkInput = false;
  }

  private restoreSelection(): void {
    if (!this.savedRange) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(this.savedRange);
  }

  //  Helpers

  private isUrl(text: string): boolean {
    if (!text || /\s/.test(text)) return false;
    if (/^(https?:\/\/|mailto:|tel:)/i.test(text)) return true;
    return /^([a-z0-9-]+\.)+[a-z]{2,}([\/?#][^\s]*)?$/i.test(text);
  }

  private normalizeUrl(url: string): string {
    return /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : `https://${url}`;
  }

  private closestTag(node: Node | null, tag: string): HTMLElement | null {
    return this.closestAnyTag(node, [tag]);
  }

  private closestAnyTag(node: Node | null, tags: string[]): HTMLElement | null {
    const upper = tags.map((t) => t.toUpperCase());
    let current: Node | null = node;
    while (current && current !== this.editor) {
      if (current instanceof HTMLElement && upper.includes(current.tagName)) return current;
      current = current.parentNode;
    }
    return null;
  }
}

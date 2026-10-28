import { EmojisPopoverService } from '../../bottom-sheets/bottom-sheets-emojis/emojis-popover.service';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  input,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { ConfirmarService } from 'src/app/services/shared/confirmar.service';
import {
  BLOCK_TAGS,
  CARET_GUARD,
  closestWithin,
  emptyParagraph,
  isAtomic,
  isBlock,
  isElement,
  isolate,
  isVisuallyEmpty,
  normalizeInline,
  rangeFromOffsets,
  serializeHtml,
  textOffset,
  unwrapNode,
} from './rich-editor-dom';
import { cleanPastedHtml, fijarDimensiones, imageNode, plainTextFragment, videoNode } from './rich-editor-paste';
import { LENGUAJES_CODIGO } from 'src/app/shared/helpers/contenido-post';
import { CLASE_VIDEO_YOUTUBE, VideoYoutube, videoYoutube } from 'src/app/shared/helpers/youtube';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';
import { RichEditorBubbleComponent } from './rich-editor-bubble.component';
import {
  BLOCK_SHORTCUTS,
  BUBBLE_EDGE,
  BUBBLE_GAP,
  BubbleMode,
  CLEARABLE_TAGS,
  EditorButton,
  HISTORY_LIMIT,
  HistoryEntry,
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  IMG_ALIGN_CLASSES,
  INLINE_MARKS,
  INLINE_SHORTCUTS,
  ImgAlign,
  InlineMark,
  MenuButton,
  PALETAS,
  PLAIN_BLOCK_TAGS,
  PosicionGuardada,
  STANDALONE_TAGS,
  StyleProp,
  TABLE_PICKER_SIZE,
  TextOffsets,
  ToolbarGroup,
  ToolbarMenu,
} from './rich-editor.config';
import { agregarColumna, agregarFila, celdaInicial, celdaVecina, crearTabla, quitarColumna, quitarFila } from './rich-editor-tablas';

@Component({
    selector: 'app-rich-editor',
    templateUrl: './rich-editor.component.html',
    styleUrls: ['./rich-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RichEditorComponent),
            multi: true,
        },
        // Mientras sube una imagen el control es inválido: el formulario no se envía sin ella (el "Subiendo…" no se
        // guarda y el post salía sin la imagen).
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => RichEditorComponent), multi: true },
    ],
    imports: [MatIcon, NgTemplateOutlet, RichEditorBubbleComponent],
})
export class RichEditorComponent implements ControlValueAccessor, Validator, AfterViewInit, OnDestroy {
  readonly placeholder = input<string>('Escribe aquí...');

  readonly wrapperEl = viewChild.required<ElementRef<HTMLDivElement>>('wrapperEl');
  readonly toolbarEl = viewChild.required<ElementRef<HTMLDivElement>>('toolbarEl');
  readonly editorEl = viewChild.required<ElementRef<HTMLDivElement>>('editorEl');
  readonly bubble = viewChild.required(RichEditorBubbleComponent);
  readonly fileInputEl = viewChild.required<ElementRef<HTMLInputElement>>('fileInputEl');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fotosService = inject(IHttpFotosService);
  private readonly emojis = inject(EmojisPopoverService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmarService = inject(ConfirmarService);

  disabled = false;
  isEmpty = true;
  openMenu: ToolbarMenu | null = null;
  showMore = false;
  dragOver = false;
  uploads = 0;
  activeMarks = new Set<InlineMark>();

  // Imagen seleccionada: marco con puntos para redimensionar (coordenadas relativas al wrapper)
  imgFrame: { top: number; left: number; width: number; height: number; label: string; clip: string | null } | null = null;
  readonly imgCorners = ['nw', 'ne', 'sw', 'se'] as const;
  private selectedImg: HTMLImageElement | null = null;
  imgAlign: ImgAlign | null = null;
  imgHasCaption = false;

  // Barra contextual sobre el bloque de código o la tabla donde está el caret
  readonly lenguajes = LENGUAJES_CODIGO;
  readonly tablePicker = Array.from({ length: TABLE_PICKER_SIZE }, (_, i) => i + 1);
  tableHover = { rows: 0, cols: 0 };
  codeBlock: HTMLElement | null = null;
  codeLang = '';
  tableCell: HTMLTableCellElement | null = null;
  ctxBar: { top: number; left: number } | null = null;
  private imgDrag: { startX: number; startWidth: number; dir: 1 | -1 } | null = null;

  // Vista de código: se edita el HTML en un textarea y se vuelca al editor al salir
  sourceMode = false;
  sourceHtml = '';

  //  Bubble (Notion-style): formato de la selección, vista previa o edición de enlace
  bubbleMode: BubbleMode | null = null;
  showBubbleColors = false;
  bubbleBelow = false; // true cuando se coloca debajo de la selección
  bubbleTop = 0;
  bubbleLeft = 0;
  bubbleArrowX = 0;
  linkHref = '';

  readonly headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  readonly palettes = PALETAS;

  readonly toolbarGroups: ToolbarGroup[] = [
    { items: [
      { icon: 'format_bold', title: 'Negrita (Ctrl+B)', mark: 'bold', run: () => this.bold() },
      { icon: 'format_italic', title: 'Cursiva (Ctrl+I)', mark: 'italic', run: () => this.italic() },
      { icon: 'format_underlined', title: 'Subrayado (Ctrl+U)', mark: 'underline', run: () => this.underline() },
      { icon: 'format_strikethrough', title: 'Tachado', mark: 'strike', run: () => this.strikeThrough() },
    ] },
    { items: [
      { icon: 'format_list_bulleted', title: 'Lista de viñetas (- espacio)', run: () => this.bulletList() },
      { icon: 'format_list_numbered', title: 'Lista ordenada (1. espacio)', run: () => this.orderedList() },
    ] },
    { items: [
      { icon: 'link', title: 'Insertar enlace (Ctrl+K)', run: () => this.insertLink() },
      { menu: 'image', icon: 'image', title: 'Insertar imagen' },
      { icon: 'smart_display', title: 'Insertar video de YouTube (o pega el enlace)', run: () => this.youtubeFromUrl() },
      { menu: 'table', icon: 'table_chart', title: 'Insertar tabla' },
      { icon: 'mood', title: 'Insertar emoji', run: () => this.abrirEmojis() },
    ] },
    { secondary: true, items: [
      { menu: 'heading', icon: 'title', title: 'Encabezado (# espacio)' },
      { menu: 'color', icon: 'format_color_text', title: 'Color y resaltado' },
    ] },
    { secondary: true, items: [
      { icon: 'code', title: 'Código inline (`texto`)', mark: 'code', run: () => this.toggleCode() },
      { icon: 'integration_instructions', title: 'Bloque de código (``` espacio)', run: () => this.toggleCodeBlock() },
      { icon: 'format_quote', title: 'Cita (> espacio)', run: () => this.toggleBlockquote() },
    ] },
    { secondary: true, items: [
      { icon: 'format_align_left', title: 'Alinear izquierda', run: () => this.applyAlign('left') },
      { icon: 'format_align_center', title: 'Centrar', run: () => this.applyAlign('center') },
      { icon: 'format_align_right', title: 'Alinear derecha', run: () => this.applyAlign('right') },
      { icon: 'format_align_justify', title: 'Justificar', run: () => this.applyAlign('justify') },
    ] },
    { secondary: true, items: [
      { icon: 'horizontal_rule', title: 'Línea horizontal ( espacio)', run: () => this.horizontalRule() },
      { icon: 'format_clear', title: 'Eliminar formato', run: () => this.removeFormat() },
    ] },
    { secondary: true, items: [
      { icon: 'undo', title: 'Deshacer (Ctrl+Z)', run: () => this.undo() },
      { icon: 'redo', title: 'Rehacer (Ctrl+Y)', run: () => this.redo() },
    ] },
  ];

  readonly bubbleMarks: EditorButton[] = [
    { icon: 'format_bold', title: 'Negrita', mark: 'bold', run: () => this.bold() },
    { icon: 'format_italic', title: 'Cursiva', mark: 'italic', run: () => this.italic() },
    { icon: 'format_underlined', title: 'Subrayado', mark: 'underline', run: () => this.underline() },
    { icon: 'format_strikethrough', title: 'Tachado', mark: 'strike', run: () => this.strikeThrough() },
    { icon: 'code', title: 'Código', mark: 'code', run: () => this.toggleCode() },
  ];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};
  private pendingValue = '';
  private lastEmitted: string | null = null;
  private initialized = false;

  // En táctiles el menú nativo de selección ya ofrece acciones: no se muestra el bubble de formato
  private readonly isTouch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

  private plainPaste = false; // Ctrl+Shift+V
  private uploadSel: PosicionGuardada | null = null; // dónde insertar las imágenes elegidas
  private emojiSel: PosicionGuardada | null = null; // dónde va el próximo emoji (el foco está en el selector)
  private internalDrag = false;
  private uploadSeq = 0;

  // Estado del bubble
  private savedSel: PosicionGuardada | null = null; // selección a la que se aplicará el enlace
  private linkEl: HTMLAnchorElement | null = null; // enlace bajo el caret / en edición
  private bubbleAnchor: (() => DOMRect | null) | null = null;

  // Historial propio (reemplaza execCommand undo/redo)
  private history: HistoryEntry[] = [];
  private historyIndex = -1;
  private snapshotTimer: ReturnType<typeof setTimeout> | undefined;

  // Reposiciona el bubble en cualquier scroll (ventana, diálogo o el propio editor)
  private scrollFrame = 0;
  private readonly onAnyScroll = () => {
    if ((!this.bubbleMode && !this.selectedImg && !this.ctxBar) || this.scrollFrame) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0;
      this.zone.run(() => {
        this.repositionBubble();
        this.positionImgFrame();
        this.positionCtxBar();
      });
    });
  };

  private get editor(): HTMLDivElement {
    return this.editorEl().nativeElement;
  }

  isMenu(item: EditorButton | MenuButton): item is MenuButton {
    return 'menu' in item;
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.setContent(this.pendingValue);
    // capture: true para enterarse también del scroll de contenedores (mat-dialog, el editor)
    this.zone.runOutsideAngular(() => document.addEventListener('scroll', this.onAnyScroll, true));
  }

  ngOnDestroy(): void {
    clearTimeout(this.snapshotTimer);
    cancelAnimationFrame(this.scrollFrame);
    document.removeEventListener('scroll', this.onAnyScroll, true);
    const boton = this.toolbarEl().nativeElement.querySelector<HTMLElement>('[aria-label="Insertar emoji"]');
    if (boton && this.emojis.estaAbiertoPara(boton)) this.emojis.cerrar();
  }

  //  ControlValueAccessor

  writeValue(value: string): void {
    const html = value || '';
    if (this.initialized && this.editorEl()) {
      this.setContent(html);
      if (this.sourceMode) this.sourceHtml = this.formatSource(this.lastEmitted ?? '');
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

  validate(): ValidationErrors | null {
    return this.uploads > 0 ? { subiendoImagenes: true } : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.openMenu = null;
      this.hideBubble();
    }
    this.cdr.markForCheck();
  }

  private setContent(html: string): void {
    this.deselectImg();
    this.editor.innerHTML = html;
    this.migrateImageSizes();
    this.normalizarRaiz();
    this.normalizeTrailing();
    this.lastEmitted = serializeHtml(this.editor);
    this.isEmpty = !this.lastEmitted;
    this.resetHistory();
    this.cdr.markForCheck();
  }

  // Emite el valor limpio; un editor sin contenido vale '' (así `required` funciona)
  private emit(): void {
    const value = serializeHtml(this.editor);
    this.isEmpty = !value;
    if (value === this.lastEmitted) return;
    this.lastEmitted = value;
    this.onChange(value);
  }

  //  Eventos del área editable

  onInput(event?: Event): void {
    this.deselectImg();
    if ((event as InputEvent | undefined)?.inputType === 'insertParagraph') this.quitarBrDeRelleno();
    if (this.raizConInline()) {
      const sel = this.offsetsOf(this.currentRange());
      if (this.normalizarRaiz() && sel) this.restoreOffsets(sel);
    }
    this.emit();
    clearTimeout(this.snapshotTimer);
    this.snapshotTimer = setTimeout(() => this.recordHistory(), 350);
  }

  onBlur(): void {
    this.onTouched();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.isComposing || this.disabled) return;

    // Con una imagen seleccionada: Supr/Retroceso la borran, Ctrl+C/Ctrl+X la copian/cortan (el navegador, sobre la
    // selección que la rodea) y una tecla que escribe sigue después de la imagen en vez de reemplazarla.
    if (this.selectedImg) {
      const img = this.selectedImg;
      const outer = this.imgOuter(img);
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        this.deselectImg();
        outer.remove();
        this.normalizarRaiz();
        this.normalizeTrailing();
        this.afterChange();
        return;
      }
      const atajo = (event.ctrlKey || event.metaKey) && !event.altKey;
      if (atajo && ['c', 'x'].includes(event.key.toLowerCase())) {
        this.seleccionarNodo(outer);
        if (event.key.toLowerCase() === 'x') this.deselectImg();
        return;
      }
      if (!atajo && !event.altKey && (event.key.length === 1 || event.key === 'Enter')) {
        this.caretDespuesDe(outer);
      }
      this.deselectImg();
    }

    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      if (key === 'v' && event.shiftKey) {
        this.plainPaste = true; // el evento paste que sigue pega texto plano
        return;
      }
      const actions: Record<string, () => void> = {
        z: () => (event.shiftKey ? this.redo() : this.undo()),
        y: () => this.redo(),
        b: () => this.bold(),
        i: () => this.italic(),
        u: () => this.underline(),
        k: () => this.insertLink(),
      };
      const action = actions[key];
      if (action) {
        event.preventDefault();
        action();
      }
      return;
    }
    if (event.altKey) return;

    let handled = false;
    switch (event.key) {
      case ' ': handled = this.blockShortcut(); break;
      case '`':
      case '*':
      case '_': handled = this.inlineShortcut(event.key); break;
      case 'Enter':
        handled = this.handleCodeEnter(event.shiftKey) || (!event.shiftKey && (this.youtubeLine() || this.handleEnter()));
        break;
      case 'Tab': handled = this.handleTab(event.shiftKey); break;
    }
    if (handled) event.preventDefault();
  }

  onPaste(event: ClipboardEvent): void {
    const data = event.clipboardData;
    if (!data || this.disabled) return;
    event.preventDefault();

    const plain = this.plainPaste;
    this.plainPaste = false;
    const range = this.currentRange();
    if (!range) return;

    const html = data.getData('text/html');
    const text = data.getData('text/plain');
    const files = Array.from(data.files);

    // Imagen copiada (captura, archivo): se sube
    if (files.length && !text.trim()) {
      this.uploadImages(files, this.guardarPosicion(range));
      return;
    }

    // URL pegada sobre texto seleccionado: lo convierte en enlace
    const url = text.trim();
    if (!range.collapsed && this.isUrl(url)) {
      this.linkOffsets(this.normalizeUrl(url), this.guardarPosicion(range));
      return;
    }

    const inCode = !!this.closestAnyTag(range.startContainer, ['PRE', 'CODE']);
    // Enlace de YouTube pegado: se inserta el reproductor (Ctrl+Shift+V lo deja como texto)
    const video = !plain && !inCode ? videoYoutube(url) : null;
    if (video) {
      this.insertVideo(video, range);
      this.afterChange();
      return;
    }

    if (inCode) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createTextNode(text));
      this.insertFragment(frag, range);
    } else {
      this.insertFragment(!plain && html ? cleanPastedHtml(html) : plainTextFragment(text), range);
      this.watchImageSize(this.editor);
    }
    this.afterChange();
  }

  //  Arrastrar y soltar (imágenes o contenido externo)

  onDragStart(): void {
    this.internalDrag = true;
  }

  onDragEnd(): void {
    this.internalDrag = false;
    this.dragOver = false;
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled || !event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    if (!(event.relatedTarget instanceof Node && this.editor.contains(event.relatedTarget))) {
      this.dragOver = false;
    }
  }

  onDrop(event: DragEvent): void {
    this.dragOver = false;
    const internal = this.internalDrag;
    this.internalDrag = false;
    const dt = event.dataTransfer;
    if (this.disabled || !dt) return;

    const point = this.rangeFromPoint(event.clientX, event.clientY);
    if (dt.files.length) {
      event.preventDefault();
      this.uploadImages(Array.from(dt.files), this.guardarPosicion(point));
      return;
    }
    if (internal) return; // mover texto dentro del editor: comportamiento nativo

    const html = dt.getData('text/html');
    const text = dt.getData('text/plain');
    if (!html && !text) return;
    event.preventDefault();
    if (point) this.selectRange(point);
    this.insertFragment(html ? cleanPastedHtml(html) : plainTextFragment(text), point ?? undefined);
    this.afterChange();
  }

  //  Toolbar

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (this.openMenu && target instanceof HTMLElement && !target.closest('.rich-editor__dropdown')) {
      this.openMenu = null;
    }
  }

  // Los clics en toolbar/bubble no deben quitar la selección del editor
  // (salvo en inputs, que necesitan recibir el foco)
  keepSelection(event: MouseEvent): void {
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)) event.preventDefault();
  }

  toggleMenu(menu: ToolbarMenu): void {
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  bold(): void          { this.toggleMark('bold'); }
  italic(): void        { this.toggleMark('italic'); }
  underline(): void     { this.toggleMark('underline'); }
  strikeThrough(): void { this.toggleMark('strike'); }
  toggleCode(): void    { this.toggleMark('code'); }

  orderedList(): void { this.structural(() => this.toggleList('OL')); }
  bulletList(): void  { this.structural(() => this.toggleList('UL')); }

  toggleBlockquote(): void {
    this.structural(() => {
      const blocks = this.selectedBlocks();
      const quotes = blocks
        .map((b) => this.closestAnyTag(b, ['BLOCKQUOTE']))
        .filter((q): q is HTMLElement => !!q);
      if (!quotes.length) return this.applyBlock('blockquote');

      // Quitar la cita: una cita "plana" pasa a párrafo; una con bloques dentro se desenvuelve
      let first: HTMLElement | null = null;
      for (const q of new Set(quotes)) {
        let result: HTMLElement;
        if (Array.from(q.children).some(isBlock)) {
          result = q.firstElementChild as HTMLElement;
          unwrapNode(q);
        } else {
          result = this.renameBlock(q, 'p');
        }
        first ??= result;
      }
      return first;
    });
  }

  toggleCodeBlock(): void {
    this.structural(() => {
      const inPre = this.selectedBlocks().some((b) => b.tagName === 'PRE');
      return this.applyBlock(inPre ? 'p' : 'pre');
    });
  }

  formatHeading(tag: string): void {
    this.structural(() => this.applyBlock(tag));
    this.openMenu = null;
  }

  insertLink(): void {
    this.openLinkEditor();
  }

  pickImage(): void {
    this.openMenu = null;
    this.uploadSel = this.guardarPosicion();
    this.fileInputEl().nativeElement.click();
  }

  /** Selector de emojis junto al botón; queda abierto y cada emoji se inserta donde estaba el cursor. */
  abrirEmojis(): void {
    this.openMenu = null;
    const boton = this.toolbarEl().nativeElement.querySelector<HTMLElement>('[aria-label="Insertar emoji"]');
    if (!boton) return;
    this.emojiSel = this.guardarPosicion();
    void this.emojis.alternar(boton, {
      alElegir: (emoji) => this.insertarEmoji(emoji),
      alCerrar: (porTeclado) => {
        // Sin preventScroll el foco subía la página al principio del editor y el cursor quedaba fuera de la vista
        if (porTeclado) {
          this.editor.focus({ preventScroll: true });
          this.restaurarPosicion(this.emojiSel);
        }
        this.emojiSel = null;
      },
    });
  }

  private insertarEmoji(emoji: string): void {
    this.editor.focus({ preventScroll: true });
    if (!this.restaurarPosicion(this.emojiSel)) this.placeCaretEnd();
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode(emoji));
    this.insertFragment(frag);
    this.afterChange();
    this.emojiSel = this.guardarPosicion();
  }

  onFilesChosen(input: HTMLInputElement): void {
    const files = Array.from(input.files || []);
    input.value = '';
    this.uploadImages(files, this.uploadSel);
    this.uploadSel = null;
  }

  // El diálogo se lleva el foco: la posición va guardada en offsets de texto y se restaura al volver.
  async imageFromUrl(): Promise<void> {
    this.openMenu = null;
    const sel = this.guardarPosicion();
    const url = await this.confirmarService.pedirTexto({
      titulo: 'Insertar imagen',
      mensaje: 'URL de la imagen:',
      placeholder: 'https://…',
      aceptar: 'Insertar',
      requerido: true,
    });
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      this.notificationService.warning('La URL de la imagen debe empezar con http:// o https://', 'Imagen no válida');
      return;
    }
    this.editor.focus();
    this.restaurarPosicion(sel);
    const frag = document.createDocumentFragment();
    const node = imageNode(url);
    this.watchImageSize(node);
    frag.appendChild(node);
    this.insertFragment(frag);
    this.afterChange();
  }

  async youtubeFromUrl(): Promise<void> {
    this.openMenu = null;
    const sel = this.guardarPosicion();
    const url = await this.confirmarService.pedirTexto({
      titulo: 'Insertar video',
      mensaje: 'Enlace del video de YouTube:',
      placeholder: 'https://www.youtube.com/watch?v=…',
      aceptar: 'Insertar',
      requerido: true,
    });
    if (!url) return;
    const video = videoYoutube(url);
    if (!video) {
      this.notificationService.warning('Pega un enlace de YouTube, por ejemplo https://www.youtube.com/watch?v=…', 'Video no válido');
      return;
    }
    this.editor.focus();
    this.restaurarPosicion(sel);
    this.insertVideo(video);
    this.afterChange();
  }

  // El video es un bloque: en una lista, celda, título o código va después del bloque de primer nivel
  // (insertFragment aplanaría el <figure> a su texto, que está vacío)
  private insertVideo(video: VideoYoutube, range: Range | null = this.currentRange()): void {
    const fig = videoNode(video);
    const host = range ? this.blockOf(range.startContainer) : null;
    const nested = !!range && !!this.closestAnyTag(range.startContainer, ['LI', 'TD', 'TH', 'PRE']);
    const flat = nested || (!!host && !['P', 'DIV', 'BLOCKQUOTE'].includes(host.tagName));
    if (!range || !flat) {
      const frag = document.createDocumentFragment();
      frag.appendChild(fig);
      this.insertFragment(frag, range);
      return;
    }
    let top: Node = host ?? range.startContainer;
    while (top.parentNode && top.parentNode !== this.editor) top = top.parentNode;
    if (top.parentNode !== this.editor) return;
    (top as ChildNode).after(fig);
    this.ensureBlockAfter(fig);
  }

  // Enter al final de un párrafo que es solo un enlace de YouTube: lo cambia por el reproductor
  private youtubeLine(): boolean {
    const range = this.currentRange();
    if (!range?.collapsed) return false;
    const block = this.blockOf(range.startContainer);
    if (!block || !['P', 'DIV'].includes(block.tagName) || block.parentNode !== this.editor) return false;
    const video = videoYoutube(block.textContent?.replace(new RegExp(CARET_GUARD, 'g'), ''));
    if (!video) return false;

    const fig = videoNode(video);
    block.replaceWith(fig);
    this.ensureBlockAfter(fig);
    this.afterChange();
    return true;
  }

  //  Tablas

  insertTable(rows: number, cols: number): void {
    this.openMenu = null;
    this.tableHover = { rows: 0, cols: 0 };
    if (!this.currentRange()) this.placeCaretEnd();
    const table = crearTabla(rows, cols);
    const frag = document.createDocumentFragment();
    frag.appendChild(table);
    this.insertFragment(frag);
    if (!isBlock(table.nextElementSibling)) table.after(emptyParagraph());
    this.selectCell(celdaInicial(table));
    this.afterTableChange();
  }

  tableAddRow(): void {
    const cell = this.liveCell();
    if (!cell) return;
    this.selectCell(agregarFila(cell));
    this.afterTableChange();
  }

  tableAddCol(): void {
    const cell = this.liveCell();
    if (!cell) return;
    this.selectCell(agregarColumna(cell));
    this.afterTableChange();
  }

  tableDeleteRow(): void {
    const cell = this.liveCell();
    if (!cell) return;
    const siguiente = quitarFila(cell);
    if (!siguiente) return this.tableDelete();
    this.selectCell(siguiente);
    this.afterTableChange();
  }

  tableDeleteCol(): void {
    const cell = this.liveCell();
    if (!cell) return;
    const siguiente = quitarColumna(cell);
    if (!siguiente) return this.tableDelete();
    this.selectCell(siguiente);
    this.afterTableChange();
  }

  tableDelete(): void {
    const table = this.liveCell()?.closest('table');
    if (!table) return;
    let p = table.nextElementSibling as HTMLElement | null;
    if (!isBlock(p)) {
      p = emptyParagraph();
      table.after(p);
    }
    table.remove();
    this.clearCtx();
    this.caretAtStart(p!);
    this.afterChange();
  }

  private liveCell(): HTMLTableCellElement | null {
    return this.tableCell?.isConnected && this.editor.contains(this.tableCell) ? this.tableCell : null;
  }

  // Deja el caret en la celda (vacía) o selecciona su texto para reemplazarlo
  private selectCell(cell: HTMLTableCellElement | null | undefined): void {
    if (!cell) return;
    this.editor.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(cell);
    if (isVisuallyEmpty(cell)) range.collapse(true);
    this.selectRange(range);
    this.tableCell = cell;
  }

  private afterTableChange(): void {
    this.afterChange();
    this.updateCtx();
  }

  // Tab / Shift+Tab: celda siguiente / anterior; en la última celda, Tab agrega una fila
  private handleTableTab(back: boolean): boolean {
    const range = this.currentRange();
    const cell = range ? (this.closestAnyTag(range.startContainer, ['TD', 'TH']) as HTMLTableCellElement | null) : null;
    if (!cell) return false;
    this.tableCell = cell;
    const vecina = celdaVecina(cell, back);
    if (vecina === 'nueva-fila') {
      this.tableAddRow();
      return true;
    }
    this.selectCell(vecina);
    this.updateCtx();
    return true;
  }

  //  Bloques de código

  setCodeLang(lang: string): void {
    const pre = this.codeBlock;
    if (!pre?.isConnected) return;
    pre.classList.remove(...Array.from(pre.classList).filter((c) => c.startsWith('language-')));
    if (lang) pre.classList.add(`language-${lang}`);
    if (!pre.classList.length) pre.removeAttribute('class');
    this.codeLang = lang;
    this.emit();
    this.recordHistory();
    this.cdr.markForCheck();
  }

  // Enter en un bloque de código: salto de línea dentro del bloque (no un <pre> nuevo).
  // En una línea vacía al final sale del bloque; Shift+Enter sale siempre.
  private handleCodeEnter(exit: boolean): boolean {
    const range = this.currentRange();
    if (!range?.collapsed) return false;
    const pre = this.closestAnyTag(range.startContainer, ['PRE']);
    if (!pre) return false;

    const text = pre.textContent || '';
    const caret = textOffset(pre, range.startContainer, range.startOffset);
    const before = text.slice(0, caret);
    const after = text.slice(caret);
    const atEnd = after === '' || after === '\n';

    if (exit || (atEnd && before.endsWith('\n'))) {
      // Quita la línea vacía final y sigue en un párrafo debajo
      if (!exit) rangeFromOffsets(pre, caret - 1, text.length).deleteContents();
      const p = emptyParagraph();
      pre.after(p);
      this.caretAtStart(p);
      this.afterChange();
      return true;
    }

    const nl = document.createTextNode('\n');
    range.insertNode(nl);
    // Un salto al final no se ve si no le sigue otro: se deja un "\n" guía
    if (after === '') pre.appendChild(document.createTextNode('\n'));
    const caretRange = document.createRange();
    caretRange.setStartAfter(nl);
    caretRange.collapse(true);
    this.selectRange(caretRange);
    this.afterChange();
    return true;
  }

  // Tab en código: sangría de dos espacios (en vez de mover el foco); Shift+Tab la quita
  private handleCodeTab(back: boolean): boolean {
    const range = this.currentRange();
    const pre = range ? this.closestAnyTag(range.startContainer, ['PRE']) : null;
    if (!range || !pre) return false;

    if (back) {
      const text = pre.textContent || '';
      const caret = textOffset(pre, range.startContainer, range.startOffset);
      const lineStart = text.lastIndexOf('\n', caret - 1) + 1;
      const spaces = /^ {1,2}/.exec(text.slice(lineStart))?.[0].length ?? 0;
      if (spaces) {
        rangeFromOffsets(pre, lineStart, lineStart + spaces).deleteContents();
        const pos = Math.max(lineStart, caret - spaces);
        this.selectRange(rangeFromOffsets(pre, pos, pos));
        this.afterChange();
      }
      return true;
    }

    range.deleteContents();
    const indent = document.createTextNode('  ');
    range.insertNode(indent);
    const caretRange = document.createRange();
    caretRange.setStartAfter(indent);
    caretRange.collapse(true);
    this.selectRange(caretRange);
    this.afterChange();
    return true;
  }

  //  Barra contextual (lenguaje del código / acciones de la tabla)

  private updateCtx(): void {
    const range = this.currentRange();
    if (!range) return; // el foco pasó a la barra (p. ej. al <select>): se conserva
    const pre = this.closestAnyTag(range.startContainer, ['PRE']);
    const cell = this.closestAnyTag(range.startContainer, ['TD', 'TH']) as HTMLTableCellElement | null;
    this.codeBlock = pre;
    this.codeLang = pre ? (Array.from(pre.classList).find((c) => c.startsWith('language-'))?.slice(9) ?? '') : '';
    this.tableCell = pre ? null : cell;
    this.positionCtxBar();
  }

  private clearCtx(): void {
    if (!this.codeBlock && !this.tableCell && !this.ctxBar) return;
    this.codeBlock = null;
    this.tableCell = null;
    this.ctxBar = null;
    this.cdr.markForCheck();
  }

  // Encima del bloque, a la izquierda; se oculta si quedaría bajo la toolbar fija o fuera de la vista
  private positionCtxBar(): void {
    const target = this.codeBlock?.isConnected ? this.codeBlock : (this.liveCell()?.closest('table') ?? null);
    if (!target) {
      this.clearCtx();
      return;
    }
    const wrap = this.wrapperEl().nativeElement.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const toolbarBottom = this.toolbarEl().nativeElement.getBoundingClientRect().bottom;
    const top = rect.top - 34;
    const visible = top >= toolbarBottom && rect.top <= Math.min(this.editor.getBoundingClientRect().bottom, window.innerHeight);
    this.ctxBar = visible ? { top: top - wrap.top, left: Math.max(rect.left - wrap.left, 4) } : null;
    this.cdr.markForCheck();
  }


  applyStyle(prop: StyleProp, value: string | null): void {
    this.openMenu = null;
    if (this.bubbleMode === 'format') this.showBubbleColors = false;

    const range = this.currentRange();
    if (!range || range.collapsed) return;
    const match = (el: HTMLElement) => el.tagName === 'SPAN' && !el.hasAttribute('class') && !!el.style[prop];
    const clear = (el: HTMLElement) => { el.style[prop] = ''; };
    const wrapper = value
      ? () => { const span = document.createElement('span'); span.style[prop] = value; return span; }
      : undefined;
    this.formatRange(range, (block, s, e) => this.reformat(block, s, e, match, clear, wrapper));
  }

  applyAlign(value: string): void {
    this.structural(() => {
      const blocks = this.selectedBlocks();
      blocks.forEach((b) => (b.style.textAlign = value === 'left' ? '' : value));
      return blocks[0];
    });
  }

  horizontalRule(): void {
    if (!this.currentRange()) this.placeCaretEnd();
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createElement('hr'));
    this.insertFragment(frag);
    this.afterChange();
  }

  // Quita marcas, colores y resaltados de la selección y deja los bloques como párrafos
  // simples (títulos, código, citas, alineación); conserva listas, enlaces e imágenes
  removeFormat(): void {
    const range = this.currentRange();
    if (!range || range.collapsed) return;
    const match = (el: HTMLElement) =>
      CLEARABLE_TAGS.includes(el.tagName) && !el.hasAttribute('class') && !isAtomic(el);
    this.formatRange(range, (block, s, e) => this.reformat(block, s, e, match, unwrapNode));
    this.structural(() => {
      const blocks = this.selectedBlocks().filter((b) => b !== this.editor).map((b) => {
        b.removeAttribute('style');
        b.removeAttribute('align');
        return PLAIN_BLOCK_TAGS.includes(b.tagName) ? this.renameBlock(b, 'p') : b;
      });
      blocks.forEach((b) => {
        const quote = b.parentElement;
        if (quote?.tagName === 'BLOCKQUOTE' && this.editor.contains(quote)) unwrapNode(quote);
      });
      return blocks[0];
    });
  }

  //  Redimensionar imágenes

  onEditorClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    // Video: un clic lo selecciona entero (Supr lo borra) y no abre el enlace de la miniatura
    const video = target?.closest?.(`figure.${CLASE_VIDEO_YOUTUBE}`);
    if (video && this.editor.contains(video)) {
      event.preventDefault();
      this.deselectImg();
      this.hideBubble();
      this.clearCtx();
      const range = document.createRange();
      range.selectNode(video);
      this.selectRange(range);
      return;
    }
    const wrap = target?.closest?.('.img-resizable');
    const img = target instanceof HTMLImageElement ? target : wrap?.querySelector('img') ?? null;
    if (this.disabled || !img || !this.editor.contains(img)) {
      this.deselectImg();
      return;
    }
    this.selectedImg = img;
    // La selección del navegador también queda sobre la imagen: así Ctrl+C / Ctrl+X y el menú contextual la copian
    // o cortan (antes solo se dibujaba el marco y se cortaba una selección vacía: "no pasaba nada").
    this.editor.focus({ preventScroll: true });
    this.seleccionarNodo(this.imgOuter(img));
    this.refreshImgState();
    this.hideBubble();
    this.clearCtx();
    this.positionImgFrame();
  }

  /** Clic derecho sobre una imagen o video: queda seleccionado entero para que "Cortar"/"Copiar" lo incluyan. */
  onEditorContextMenu(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const nodo = target?.closest?.<HTMLElement>(`figure.img-figure, .img-resizable, figure.${CLASE_VIDEO_YOUTUBE}`);
    if (!nodo || !this.editor.contains(nodo) || this.disabled) return;
    this.seleccionarNodo(nodo.closest('figure.img-figure') ?? nodo);
  }

  private seleccionarNodo(node: Node): void {
    const range = document.createRange();
    range.selectNode(node);
    this.selectRange(range);
  }

  /** Lleva a la vista el cursor (o el elemento) si quedó fuera de la pantalla o debajo de la toolbar fija. */
  private mostrarCursor(objetivo: Range | HTMLElement): void {
    const rect = objetivo instanceof Range ? this.rangeRect(objetivo) : objetivo.getBoundingClientRect();
    const toolbarBottom = this.toolbarEl().nativeElement.getBoundingClientRect().bottom;
    if (rect && rect.top >= Math.max(toolbarBottom, 0) && rect.bottom <= window.innerHeight) return;
    const el = objetivo instanceof Range
      ? (isElement(objetivo.startContainer) ? objetivo.startContainer : objetivo.startContainer.parentElement)
      : objetivo;
    // instant: con scroll suave el bubble se mediría antes de terminar el desplazamiento (y se ocultaría)
    el?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }

  /** ¿El cursor (colapsado) está pegado a `node`, adentro o en uno de sus dos lados? */
  private cursorJuntoA(node: Node): boolean {
    const range = this.currentRange();
    if (!range?.collapsed) return false;
    if (node.contains(range.startContainer)) return true;
    const parent = node.parentNode;
    if (range.startContainer !== parent || !parent) return false;
    const i = Array.prototype.indexOf.call(parent.childNodes, node);
    return range.startOffset === i || range.startOffset === i + 1;
  }

  /** Cursor justo después de una imagen/figura (en un bloque editable si la figura es un bloque). */
  private caretDespuesDe(node: HTMLElement): void {
    if (node.tagName === 'FIGURE') {
      this.ensureBlockAfter(node);
      return;
    }
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    this.selectRange(range);
  }

  startImgResize(event: PointerEvent, corner: 'nw' | 'ne' | 'sw' | 'se'): void {
    if (!this.selectedImg) return;
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.imgDrag = {
      startX: event.clientX,
      startWidth: this.selectedImg.getBoundingClientRect().width,
      dir: corner.endsWith('e') ? 1 : -1,
    };
  }

  moveImgResize(event: PointerEvent): void {
    if (!this.imgDrag || !this.selectedImg) return;
    const width = this.imgDrag.startWidth + (event.clientX - this.imgDrag.startX) * this.imgDrag.dir;
    this.applyImgWidth(Math.min(Math.max(width, 40), this.maxImgWidth()));
  }

  endImgResize(event: PointerEvent): void {
    if (!this.imgDrag) return;
    this.imgDrag = null;
    (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.commitImg();
  }

  setImgWidth(size: 'full' | 'half' | null): void {
    if (!this.selectedImg) return;
    if (size === null) this.applyImgWidth(null);
    else this.applyImgWidth(size === 'full' ? this.maxImgWidth() : this.maxImgWidth() / 2);
    this.commitImg();
  }

  setImgAlign(align: ImgAlign): void {
    const img = this.selectedImg;
    if (!img) return;
    const outer = this.imgOuter(img);
    const same = this.imgAlign === align;
    outer.classList.remove(...IMG_ALIGN_CLASSES);
    if (!same) outer.classList.add(`img-${align}`); // otro clic en la misma alineación la quita
    if (!outer.classList.length) outer.removeAttribute('class');
    this.commitImg();
  }

  // Pie de foto: la imagen pasa a un <figure> (no editable) con <figcaption>; vacío lo quita
  async editImgCaption(): Promise<void> {
    const img = this.selectedImg;
    const wrap = img?.closest<HTMLElement>('.img-resizable');
    if (!img || !wrap) return;
    const figure = wrap.closest<HTMLElement>('figure.img-figure');
    const actual = figure?.querySelector('figcaption')?.textContent ?? '';
    const caption = await this.confirmarService.pedirTexto({
      titulo: 'Pie de foto',
      mensaje: 'Déjalo vacío para quitarlo.',
      valor: actual,
      aceptar: 'Guardar',
      peligro: false,
    });
    // Mientras el diálogo estaba abierto la imagen pudo borrarse (o deshacerse) desde otro lado.
    if (caption === null || !this.editor.contains(wrap)) return;

    if (figure && !caption) {
      // Sin pie: la imagen vuelve a un párrafo, con su alineación
      wrap.classList.add(...IMG_ALIGN_CLASSES.filter((c) => figure.classList.contains(c)));
      const p = document.createElement('p');
      p.appendChild(wrap);
      figure.replaceWith(p);
    } else if (figure) {
      figure.querySelector('figcaption')!.textContent = caption;
    } else if (caption) {
      const fig = document.createElement('figure');
      fig.className = 'img-figure';
      fig.setAttribute('contenteditable', 'false');
      const align = IMG_ALIGN_CLASSES.filter((c) => wrap.classList.contains(c));
      wrap.classList.remove(...align);
      fig.classList.add(...align);
      const cap = document.createElement('figcaption');
      cap.textContent = caption;
      // El <figure> es un bloque: va después del párrafo que tenía la imagen, no dentro
      const block = this.blockOf(wrap);
      if (block && block !== this.editor) block.after(fig);
      else wrap.before(fig);
      fig.append(wrap, cap);
      if (block && block !== this.editor && isVisuallyEmpty(block)) block.remove();
      if (!isBlock(fig.nextElementSibling)) fig.after(emptyParagraph());
    }
    this.normalizeTrailing();
    this.commitImg();
  }

  private imgOuter(img: HTMLImageElement): HTMLElement {
    return img.closest<HTMLElement>('figure.img-figure') ?? img.closest<HTMLElement>('.img-resizable') ?? img;
  }

  private refreshImgState(): void {
    const img = this.selectedImg;
    if (!img) return;
    const outer = this.imgOuter(img);
    const cls = IMG_ALIGN_CLASSES.find((c) => outer.classList.contains(c));
    this.imgAlign = cls ? (cls.slice(4) as ImgAlign) : null;
    this.imgHasCaption = !!img.closest('figure.img-figure');
  }

  // Ancho elegido + alto proporcional: con width y height el navegador reserva el espacio antes de que cargue la
  // imagen (el post no "salta"). "Auto" deja las dimensiones reales (el CSS la limita al ancho disponible).
  private applyImgWidth(width: number | null): void {
    const img = this.selectedImg!;
    img.style.width = '';
    img.style.height = '';
    if (width === null) {
      img.removeAttribute('width');
      img.removeAttribute('height');
      fijarDimensiones(img);
    } else {
      const w = Math.round(width);
      img.setAttribute('width', `${w}`);
      if (img.naturalWidth) img.setAttribute('height', `${Math.round((w * img.naturalHeight) / img.naturalWidth)}`);
      else img.removeAttribute('height');
    }
    this.positionImgFrame();
  }

  // Cuando cada imagen termina de cargar se le ponen sus dimensiones (si no las tiene). Al abrir un post (`notify`
  // false) no se emite: no es un cambio de la persona; se guardan con la próxima edición.
  private watchImageSize(root: HTMLElement, notify = true): void {
    const imgs = root instanceof HTMLImageElement ? [root] : Array.from(root.querySelectorAll('img'));
    imgs.forEach((img) => {
      if (img.hasAttribute('width') && img.hasAttribute('height')) return;
      const fix = () => {
        if (!this.editor.contains(img) || !fijarDimensiones(img)) return;
        if (notify) this.emit();
        if (img === this.selectedImg) this.positionImgFrame();
      };
      if (img.complete && img.naturalWidth) fix();
      else img.addEventListener('load', fix, { once: true });
    });
  }


  private commitImg(): void {
    this.refreshImgState();
    this.emit();
    this.recordHistory();
    this.positionImgFrame();
  }

  // Ancho útil del área editable (sin el padding)
  private maxImgWidth(): number {
    const style = getComputedStyle(this.editor);
    return this.editor.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  }

  private positionImgFrame(): void {
    const img = this.selectedImg;
    if (!img?.isConnected) {
      this.deselectImg();
      return;
    }
    const wrap = this.wrapperEl().nativeElement.getBoundingClientRect();
    const rect = img.getBoundingClientRect();

    // Solo la parte visible del área editable: no se dibuja sobre la toolbar fija,
    // el header de la página ni fuera del scroll propio del editor
    const content = this.editor.getBoundingClientRect();
    const toolbarBottom = this.toolbarEl().nativeElement.getBoundingClientRect().bottom;
    const visibleTop = Math.max(content.top, toolbarBottom, 0);
    const visibleBottom = Math.min(content.bottom, window.innerHeight);
    if (rect.bottom <= visibleTop || rect.top >= visibleBottom) {
      this.imgFrame = null;
      this.cdr.markForCheck();
      return;
    }

    const width = Math.round(rect.width);
    const clipTop = Math.max(0, visibleTop - rect.top);
    const clipBottom = Math.max(0, rect.bottom - visibleBottom);
    this.imgFrame = {
      top: rect.top - wrap.top,
      left: rect.left - wrap.left,
      width,
      height: rect.height,
      label: img.hasAttribute('width') ? `${width} px` : `${width} px (auto)`,
      // Margen para que los puntos de las esquinas no se corten cuando todo es visible
      clip: clipTop || clipBottom ? `inset(${clipTop}px -8px ${clipBottom}px -8px)` : null,
    };
    this.cdr.markForCheck();
  }

  private deselectImg(): void {
    if (!this.selectedImg && !this.imgFrame) return;
    this.selectedImg = null;
    this.imgDrag = null;
    this.imgFrame = null;
    this.imgAlign = null;
    this.imgHasCaption = false;
    this.cdr.markForCheck();
  }

  // Posts viejos: el tamaño quedaba en el style del span (resize nativo); se pasa a la imagen
  private migrateImageSizes(): void {
    this.editor.querySelectorAll<HTMLElement>('.img-resizable').forEach((wrap) => {
      const width = parseFloat(wrap.style.width);
      const img = wrap.querySelector('img');
      if (img && width && !img.hasAttribute('width')) img.setAttribute('width', `${Math.round(width)}`);
      wrap.style.width = '';
      wrap.style.height = '';
      if (!wrap.getAttribute('style')) wrap.removeAttribute('style');
    });
    // El servidor no guarda contenteditable: imágenes, pies de foto y videos vuelven a ser bloques atómicos
    this.editor
      .querySelectorAll<HTMLElement>(`.img-resizable, figure.img-figure, figure.${CLASE_VIDEO_YOUTUBE}`)
      .forEach((el) => el.setAttribute('contenteditable', 'false'));
    this.watchImageSize(this.editor, false);
  }

  toggleSource(): void {
    this.openMenu = null;
    this.deselectImg();
    this.hideBubble();
    if (!this.sourceMode) {
      this.sourceHtml = this.formatSource(serializeHtml(this.editor));
      this.sourceMode = true;
      return;
    }
    // Al volver se reinterpreta el HTML (el navegador corrige etiquetas mal cerradas)
    this.sourceMode = false;
    this.editor.innerHTML = this.sourceHtml.trim();
    this.migrateImageSizes();
    this.normalizarRaiz();
    this.normalizeTrailing();
    this.emit();
    this.recordHistory();
    this.placeCaretEnd();
    this.cdr.markForCheck();
  }

  onSourceInput(event: Event): void {
    this.sourceHtml = (event.target as HTMLTextAreaElement).value;
    const value = this.sourceHtml.trim();
    this.isEmpty = !value;
    if (value === this.lastEmitted) return;
    this.lastEmitted = value;
    this.onChange(value);
  }

  // Un bloque por línea para que el HTML sea legible (no toca el interior de <pre>)
  private formatSource(html: string): string {
    return html
      .replace(/(<\/(?:p|h[1-6]|ul|ol|li|blockquote|pre|div)>|<hr\s*\/?>)(?!\n)/gi, '$1\n')
      .replace(/(<(?:ul|ol)(?:\s[^>]*)?>)(?!\n)/gi, '$1\n')
      .trim();
  }

  undo(): void {
    this.registrarPendiente();
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this.restoreHistory();
  }

  redo(): void {
    this.registrarPendiente();
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    this.restoreHistory();
  }

  //  Bubble

  @HostListener('document:selectionchange')
  onSelectionChange(): void {
    if (!this.initialized || this.bubbleMode === 'edit-link') return;
    const range = this.currentRange();
    if (!range) {
      if (this.bubbleMode) this.hideBubble();
      return;
    }
    this.activeMarks = this.marksAt(range);
    this.updateCtx();

    const link = range.collapsed ? this.closestAnyTag(range.startContainer, ['A']) : null;
    if (!range.collapsed && range.toString().trim() && !this.isTouch) {
      this.showBubbleAt('format', () => this.rangeRect(this.currentRange()));
    } else if (link) {
      this.linkEl = link as HTMLAnchorElement;
      this.linkHref = link.getAttribute('href') || '';
      this.showBubbleAt('link', () => (link.isConnected ? link.getBoundingClientRect() : null));
    } else if (this.bubbleMode) {
      this.hideBubble();
    }
  }

  @HostListener('window:resize')
  onViewportChange(): void {
    this.repositionBubble();
    if (this.selectedImg) this.positionImgFrame();
    this.positionCtxBar();
  }

  @HostListener('document:mousedown', ['$event.target'])
  onDocMouseDown(target: EventTarget | null): void {
    if (this.selectedImg && target instanceof Node && !this.host.nativeElement.contains(target)) {
      this.deselectImg();
    }
    if (this.bubbleMode && target instanceof Node && !this.host.nativeElement.contains(target)) {
      this.hideBubble();
    }
    if (target instanceof Node && !this.host.nativeElement.contains(target)) this.clearCtx();
  }

  toggleBubbleColors(): void {
    this.showBubbleColors = !this.showBubbleColors;
    // El bubble crece: recalcula para que no tape la selección ni la toolbar
    this.cdr.detectChanges();
    this.repositionBubble();
  }

  // Abre el input de enlace: sobre el enlace bajo el caret, la selección o (sin
  // selección) para insertar uno nuevo en el caret
  openLinkEditor(): void {
    if (this.disabled) return;
    const range = this.currentRange();
    const existing = this.bubbleMode === 'link' ? this.linkEl
      : (range ? this.closestAnyTag(range.commonAncestorContainer, ['A']) as HTMLAnchorElement | null : null);

    if (!existing) {
      if (!range) {
        this.placeCaretEnd();
        return this.openLinkEditor();
      }
      // Texto seleccionado que ya es una URL: se enlaza directo
      const text = range.toString().trim();
      if (!range.collapsed && this.isUrl(text)) {
        this.linkOffsets(this.normalizeUrl(text), this.guardarPosicion(range));
        return;
      }
    }

    this.linkEl = existing;
    this.linkHref = existing?.getAttribute('href') || '';
    // El bubble se oculta si su ancla no está a la vista: con el cursor fuera de la pantalla Ctrl+K "no hacía nada"
    if (range) this.mostrarCursor(existing ?? range);
    this.savedSel = this.guardarPosicion(range);
    this.showBubbleColors = false;
    this.showBubbleAt('edit-link', () => {
      if (this.linkEl?.isConnected) return this.linkEl.getBoundingClientRect();
      return this.rangeRect(this.rangoGuardado(this.savedSel));
    });
    setTimeout(() => this.bubble().inputEnlace()?.nativeElement.select(), 0);
  }

  applyLink(): void {
    const url = (this.bubble().inputEnlace()?.nativeElement.value || '').trim();
    const link = this.linkEl;
    const sel = this.savedSel;
    this.hideBubble();
    this.editor.focus();

    if (link?.isConnected) {
      if (url) link.setAttribute('href', this.normalizeUrl(url));
      else unwrapNode(link);
      this.restaurarPosicion(sel);
      this.afterChange();
    } else if (url && sel) {
      this.linkOffsets(this.normalizeUrl(url), sel);
    } else {
      this.restaurarPosicion(sel);
    }
  }

  cancelLink(): void {
    const sel = this.savedSel;
    this.hideBubble();
    this.editor.focus();
    this.restaurarPosicion(sel);
  }

  removeLink(): void {
    const link = this.linkEl;
    const sel = this.savedSel ?? this.guardarPosicion();
    this.hideBubble();
    this.editor.focus();

    if (link?.isConnected) {
      unwrapNode(link);
      this.restaurarPosicion(sel);
      this.afterChange();
      return;
    }
    const range = this.rangoGuardado(sel);
    if (range && !range.collapsed) {
      this.formatRange(range, (block, s, e) => this.reformat(block, s, e, (el) => el.tagName === 'A', unwrapNode));
    }
  }

  //  Motor de formato inline (por bloque, con offsets de texto)

  private toggleMark(mark: InlineMark): void {
    const range = this.currentRange();
    if (!range || range.collapsed) return;
    const { tags, create } = INLINE_MARKS[mark];
    const match = (el: HTMLElement) => tags.includes(el.tagName);
    // Si todo lo seleccionado ya tiene la marca se quita; si no, se aplica a todo
    const wrapper = this.rangeHasMark(range, tags) ? undefined : () => document.createElement(create);
    this.formatRange(range, (block, s, e) => this.reformat(block, s, e, match, unwrapNode, wrapper));
  }

  // Aplica `op` a cada bloque que toca el rango (así nunca se envuelven bloques en
  // un inline), normaliza y restaura la selección
  private formatRange(range: Range, op: (block: HTMLElement, start: number, end: number) => void): void {
    const sel = this.offsetsOf(range);
    this.blockSlices(range).forEach(({ block, start, end }) => op(block, start, end));
    normalizeInline(this.editor);
    if (sel) this.restoreOffsets(sel);
    this.afterChange();
  }

  // Quita el formato `match` del tramo [start, end) de `block` y, opcionalmente, lo
  // envuelve en `wrapper`. Los ancestros con el formato se dividen para que solo
  // cambie la parte seleccionada.
  private reformat(
    block: HTMLElement,
    start: number,
    end: number,
    match: (el: HTMLElement) => boolean,
    clear: (el: HTMLElement) => void,
    wrapper?: () => HTMLElement,
  ): void {
    for (let guard = 0; guard < 20; guard++) {
      const range = rangeFromOffsets(block, start, end);
      const ancestor = closestWithin(range.commonAncestorContainer, block, match);
      if (!ancestor) break;
      clear(isolate(ancestor, range));
    }

    const range = rangeFromOffsets(block, start, end);
    const frag = range.extractContents();
    frag.querySelectorAll<HTMLElement>('*').forEach((el) => match(el) && clear(el));
    if (wrapper) {
      const el = wrapper();
      el.appendChild(frag);
      range.insertNode(el);
    } else {
      range.insertNode(frag);
    }
  }

  private blockSlices(range: Range): { block: HTMLElement; start: number; end: number }[] {
    const blocks = this.selectedBlocks(range);
    if (blocks.length === 0) blocks.push(this.editor);

    return blocks
      .map((block) => {
        const r = document.createRange();
        r.selectNodeContents(block);
        if (block.contains(range.startContainer)) r.setStart(range.startContainer, range.startOffset);
        if (block.contains(range.endContainer)) r.setEnd(range.endContainer, range.endOffset);
        return {
          block,
          start: textOffset(block, r.startContainer, r.startOffset),
          end: textOffset(block, r.endContainer, r.endOffset),
        };
      })
      .filter((slice) => slice.end > slice.start);
  }

  // Nodos de texto con contenido realmente seleccionado
  private selectedTextNodes(range: Range): Text[] {
    const root = range.commonAncestorContainer;
    const nodes: Text[] = [];
    if (root.nodeType === Node.TEXT_NODE) {
      nodes.push(root as Text);
    } else {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (range.intersectsNode(n)) nodes.push(n as Text);
      }
    }
    return nodes.filter((n) => {
      if (n === range.startContainer && range.startOffset >= n.data.length) return false;
      if (n === range.endContainer && range.endOffset === 0) return false;
      return !!n.data.replace(new RegExp(CARET_GUARD, 'g'), '').trim();
    });
  }

  private rangeHasMark(range: Range, tags: string[]): boolean {
    const nodes = this.selectedTextNodes(range);
    return nodes.length > 0 && nodes.every((n) => !!this.closestAnyTag(n, tags));
  }

  private marksAt(range: Range): Set<InlineMark> {
    const marks = new Set<InlineMark>();
    (Object.keys(INLINE_MARKS) as InlineMark[]).forEach((mark) => {
      const { tags } = INLINE_MARKS[mark];
      const active = range.collapsed ? !!this.closestAnyTag(range.startContainer, tags) : this.rangeHasMark(range, tags);
      if (active) marks.add(mark);
    });
    return marks;
  }

  private linkOffsets(url: string, sel: PosicionGuardada | null): void {
    this.editor.focus();
    const range = this.restaurarPosicion(sel);
    if (!range) return;

    if (range.collapsed) {
      // Sin selección: inserta el enlace usando la URL como texto
      const frag = document.createDocumentFragment();
      const a = this.anchor(url);
      a.textContent = url;
      frag.append(a, document.createTextNode(CARET_GUARD));
      this.insertFragment(frag, range);
      this.afterChange();
      return;
    }
    const match = (el: HTMLElement) => el.tagName === 'A';
    this.formatRange(range, (block, s, e) => this.reformat(block, s, e, match, unwrapNode, () => this.anchor(url)));
  }

  private anchor(url: string): HTMLAnchorElement {
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    return a;
  }

  //  Inserción de contenido

  // Inserta contenido en el rango. El contenido de bloque divide el bloque actual
  // (no se anidan <p> dentro de <p>); dentro de listas/encabezados se aplana.
  private insertFragment(frag: DocumentFragment, range: Range | null | undefined = this.currentRange()): void {
    if (!range) {
      this.placeCaretEnd();
      range = this.currentRange();
      if (!range) return;
    }
    range.deleteContents();

    let nodes: Node[] = Array.from(frag.childNodes);
    if (!nodes.length) return;

    const host = this.blockOf(range.startContainer);
    const isBlockNode = (n: Node) => isBlock(n) || (isElement(n) && STANDALONE_TAGS.includes(n.tagName));
    const hasBlocks = nodes.some(isBlockNode);

    // Dentro de una celda tampoco se insertan bloques (ni tablas anidadas)
    const inCell = !!this.closestAnyTag(range.startContainer, ['TD', 'TH']);
    const flatHost = !!host && host.tagName !== 'P' && host.tagName !== 'DIV' && host.tagName !== 'BLOCKQUOTE';
    if (hasBlocks && (flatHost || inCell)) {
      if (host?.tagName === 'PRE') {
        nodes = [document.createTextNode(nodes.map((n) => n.textContent).join('\n'))];
      } else {
        nodes = this.flattenBlocks(nodes);
      }
      return this.insertInline(nodes, range);
    }
    if (!hasBlocks) return this.insertInline(nodes, range);

    const blocks = this.wrapLooseInline(nodes);
    const last = blocks[blocks.length - 1];

    if (host && host !== this.editor) {
      // Divide el bloque actual en el caret e inserta los bloques entre las dos mitades
      const tail = document.createRange();
      tail.setStart(range.startContainer, range.startOffset);
      tail.setEndAfter(host);
      const tailFrag = tail.extractContents();
      host.after(...blocks);
      const tailBlock = tailFrag.firstChild;
      last.after(tailFrag);
      if (isVisuallyEmpty(host)) host.remove();
      if (tailBlock && isVisuallyEmpty(tailBlock)) (tailBlock as ChildNode).remove();
    } else {
      const holder = document.createDocumentFragment();
      holder.append(...blocks);
      range.insertNode(holder);
    }
    // Tras una línea horizontal siempre queda un bloque donde seguir escribiendo
    if (['HR', 'TABLE', 'FIGURE'].includes(last.tagName)) this.ensureBlockAfter(last);
    else this.caretAtEnd(last);
    this.normalizeTrailing();
  }

  private insertInline(nodes: Node[], range: Range): void {
    const holder = document.createDocumentFragment();
    holder.append(...nodes);
    const last = nodes[nodes.length - 1];
    range.insertNode(holder);

    // Imagen suelta al final del editor: deja un párrafo para seguir escribiendo. Solo si es lo último: en medio
    // del texto ese párrafo partía el renglón en dos y mandaba el cursor a otra línea.
    if (last.parentNode === this.editor && !isBlock(last) && !last.nextSibling) {
      this.ensureBlockAfter(last);
      return;
    }
    const caret = document.createRange();
    caret.setStartAfter(last);
    caret.collapse(true);
    this.selectRange(caret);
  }

  // Bloques -> su contenido inline separado por <br>
  private flattenBlocks(nodes: Node[]): Node[] {
    const out: Node[] = [];
    nodes.forEach((n) => {
      if (isElement(n) && (isBlock(n) || ['UL', 'OL', 'TABLE', 'FIGURE'].includes(n.tagName))) {
        if (out.length) out.push(document.createElement('br'));
        out.push(document.createTextNode(n.textContent || ''));
      } else if (!(isElement(n) && n.tagName === 'HR')) {
        out.push(n);
      }
    });
    return out;
  }

  // Agrupa nodos inline sueltos en párrafos
  private wrapLooseInline(nodes: Node[]): HTMLElement[] {
    const blocks: HTMLElement[] = [];
    let p: HTMLElement | null = null;
    nodes.forEach((n) => {
      if (isElement(n) && (isBlock(n) || STANDALONE_TAGS.includes(n.tagName))) {
        blocks.push(n);
        p = null;
      } else if (n.nodeType !== Node.TEXT_NODE || (n as Text).data.trim()) {
        if (!p) blocks.push((p = document.createElement('p')));
        p.appendChild(n);
      }
    });
    return blocks;
  }

  private uploadImages(files: File[], at: PosicionGuardada | null): void {
    const valid = files.filter((f) => IMAGE_TYPES.includes(f.type) && f.size <= IMAGE_MAX_BYTES);
    if (valid.length < files.length) {
      this.notificationService.warning('Solo se permiten imágenes JPG, PNG, GIF o WEBP de hasta 8 MB', 'Imagen no válida');
    }
    if (!valid.length) return;

    this.editor.focus();
    if (!this.restaurarPosicion(at) && !this.currentRange()) this.placeCaretEnd();

    valid.forEach((file) => {
      const id = `${++this.uploadSeq}`;
      const placeholder = document.createElement('span');
      placeholder.className = 'rich-editor__uploading';
      placeholder.dataset['upload'] = id;
      placeholder.setAttribute('contenteditable', 'false');
      placeholder.textContent = 'Subiendo imagen…';

      const frag = document.createDocumentFragment();
      frag.appendChild(placeholder);
      this.insertFragment(frag);
      this.uploads++;
      this.onValidatorChange();

      this.fotosService
        .uploadImage(file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (url) => this.finishUpload(id, url),
          error: () => this.finishUpload(id, null),
        });
    });
    this.afterChange();
  }

  // Se busca el placeholder por id: un deshacer pudo haber recreado el nodo
  private finishUpload(id: string, url: string | null): void {
    this.uploads = Math.max(0, this.uploads - 1);
    this.onValidatorChange();
    const placeholder = this.editor.querySelector<HTMLElement>(`[data-upload="${id}"]`);
    if (placeholder) {
      // Chrome mueve el cursor ANTES del nodo reemplazado: lo que se escribía después de subir quedaba delante de la
      // imagen. Si el cursor estaba junto al "Subiendo…", queda después de la imagen.
      const cursorAhi = this.cursorJuntoA(placeholder);
      if (url) {
        const node = imageNode(url);
        this.watchImageSize(node);
        placeholder.replaceWith(node);
        if (cursorAhi) this.caretDespuesDe(node);
      } else {
        const range = document.createRange();
        range.setStartBefore(placeholder);
        range.collapse(true);
        placeholder.remove();
        if (cursorAhi) this.selectRange(range);
      }
      this.emit();
      this.recordHistory();
    }
    this.cdr.markForCheck();
  }

  //  Atajos de teclado tipo markdown y comportamiento de listas/citas

  private blockShortcut(): boolean {
    const range = this.currentRange();
    if (!range?.collapsed) return false;
    const block = this.blockOf(range.startContainer);
    if (!block || !['P', 'DIV'].includes(block.tagName) || block.hasAttribute('class')) return false;
    if (this.closestAnyTag(block, ['TD', 'TH'])) return false;

    const before = document.createRange();
    before.setStart(block, 0);
    before.setEnd(range.startContainer, range.startOffset);
    const prefix = before.toString();
    const rule = BLOCK_SHORTCUTS.find((r) => r.pattern.test(prefix));
    if (!rule) return false;

    before.deleteContents();
    if (!block.firstChild) block.appendChild(document.createElement('br'));

    let target: HTMLElement;
    switch (rule.block) {
      case 'heading': target = this.renameBlock(block, `h${prefix.length}`); break;
      case 'UL':
      case 'OL': target = this.listFromBlock(block, rule.block); break;
      case 'hr': block.before(document.createElement('hr')); target = block; break;
      default: target = this.renameBlock(block, rule.block);
    }
    this.caretAtStart(target);
    this.afterChange();
    return true;
  }

  private inlineShortcut(key: string): boolean {
    const range = this.currentRange();
    if (!range?.collapsed || range.startContainer.nodeType !== Node.TEXT_NODE) return false;
    const text = range.startContainer as Text;
    if (this.closestAnyTag(text, ['CODE', 'PRE'])) return false;

    const before = text.data.slice(0, range.startOffset);
    for (const rule of INLINE_SHORTCUTS) {
      if (rule.key !== key) continue;
      const m = before.match(rule.pattern);
      if (!m) continue;

      const content = m[1];
      const start = range.startOffset - rule.typed - content.length - rule.open;
      text.splitText(range.startOffset);
      text.data = text.data.slice(0, start);

      const el = document.createElement(rule.tag);
      el.textContent = content;
      // Caracter guía fuera del inline para que lo siguiente que se escriba no herede el formato
      const guard = document.createTextNode(CARET_GUARD);
      text.after(el, guard);

      const caret = document.createRange();
      caret.setStart(guard, 1);
      caret.collapse(true);
      this.selectRange(caret);
      this.afterChange();
      return true;
    }
    return false;
  }

  private handleEnter(): boolean {
    const range = this.currentRange();
    if (!range?.collapsed) return false;

    // Enter en un ítem vacío: sale de la lista (o sube un nivel si está anidada)
    const li = this.closestAnyTag(range.startContainer, ['LI']);
    if (li) {
      if (!isVisuallyEmpty(li)) return false;
      this.caretAtStart(this.outdent(li));
      this.afterChange();
      return true;
    }

    // Enter en una línea vacía de una cita: sale de la cita
    const quote = this.closestAnyTag(range.startContainer, ['BLOCKQUOTE']);
    const line = this.blockOf(range.startContainer);
    if (quote && line && isVisuallyEmpty(line)) {
      let p: HTMLElement;
      if (line === quote) {
        p = this.renameBlock(quote, 'p');
      } else {
        line.remove();
        p = emptyParagraph();
        quote.after(p);
      }
      this.caretAtStart(p);
      this.afterChange();
      return true;
    }
    return false;
  }

  private handleTab(outdent: boolean): boolean {
    if (this.handleCodeTab(outdent) || this.handleTableTab(outdent)) return true;
    const range = this.currentRange();
    const first = range ? this.closestAnyTag(range.startContainer, ['LI']) : null;
    if (!first) return false; // fuera de listas Tab mueve el foco, como siempre

    const items = this.selectedBlocks().filter((b) => b.tagName === 'LI');
    if (!items.includes(first)) items.unshift(first);
    this.structural(() => {
      items.forEach((li) => (outdent ? this.outdent(li) : this.indent(li)));
      return first.isConnected ? first : null;
    });
    return true;
  }

  private indent(li: HTMLElement): void {
    const prev = li.previousElementSibling as HTMLElement | null;
    if (prev?.tagName !== 'LI') return;
    let sub = prev.lastElementChild as HTMLElement | null;
    if (!sub || !['UL', 'OL'].includes(sub.tagName)) {
      sub = document.createElement(li.parentElement!.tagName);
      prev.appendChild(sub);
    }
    sub.appendChild(li);
  }

  // Sube un nivel el ítem; en el primer nivel lo convierte en párrafo. Devuelve el
  // elemento que conserva el contenido.
  private outdent(li: HTMLElement): HTMLElement {
    const list = li.parentElement!;
    const rest = this.nextSiblings(li);
    const parentLi = list.parentElement?.tagName === 'LI' ? list.parentElement : null;

    if (parentLi) {
      // Los ítems siguientes pasan a ser hijos del ítem que sube
      if (rest.length) {
        const sub = document.createElement(list.tagName);
        sub.append(...rest);
        li.appendChild(sub);
      }
      parentLi.after(li);
      if (!list.children.length) list.remove();
      return li;
    }

    const p = document.createElement('p');
    const nested: Element[] = [];
    Array.from(li.childNodes).forEach((n) => {
      if (isElement(n) && ['UL', 'OL'].includes(n.tagName)) nested.push(n);
      else p.appendChild(n);
    });
    if (!p.firstChild) p.appendChild(document.createElement('br'));

    list.after(p);
    let after: Element = p;
    if (nested.length) {
      after.after(...nested);
      after = nested[nested.length - 1];
    }
    if (rest.length) {
      const tail = document.createElement(list.tagName);
      tail.append(...rest);
      after.after(tail);
    }
    li.remove();
    if (!list.children.length) list.remove();
    return p;
  }

  private nextSiblings(el: Element): Element[] {
    const out: Element[] = [];
    for (let n = el.nextElementSibling; n; n = n.nextElementSibling) out.push(n);
    return out;
  }

  //  Comandos de bloque

  // Ejecuta un cambio estructural conservando la selección. `fn` puede devolver el
  // bloque resultante para dejar ahí el caret cuando está vacío (sin texto que ubicar).
  private structural(fn: () => HTMLElement | null | undefined): void {
    const sel = this.offsetsOf(this.currentRange());
    const target = fn();
    if (target?.isConnected && isVisuallyEmpty(target)) this.caretAtStart(target);
    else if (sel) this.restoreOffsets(sel);
    this.afterChange();
  }

  private applyBlock(tag: string): HTMLElement | null {
    // Los ítems de lista no se convierten (un <h2> dentro de <ul> no es válido)
    const blocks = this.selectedBlocks().filter((b) => b.tagName !== 'LI');
    if (blocks.length === 0) {
      const range = this.currentRange();
      if (!range || range.collapsed || this.closestAnyTag(range.startContainer, ['LI'])) return null;
      const el = document.createElement(tag);
      el.appendChild(range.extractContents());
      range.insertNode(el);
      return el;
    }
    return blocks.map((b) => this.renameBlock(b, tag))[0];
  }

  private renameBlock(block: HTMLElement, tag: string): HTMLElement {
    if (block.tagName === tag.toUpperCase()) return block;
    const el = document.createElement(tag);
    if (block.style.textAlign) el.style.textAlign = block.style.textAlign;
    while (block.firstChild) el.appendChild(block.firstChild);
    block.replaceWith(el);
    return el;
  }

  private listFromBlock(block: HTMLElement, listTag: string): HTMLElement {
    const li = document.createElement('li');
    while (block.firstChild) li.appendChild(block.firstChild);
    const prev = block.previousElementSibling;
    if (prev?.tagName === listTag) {
      // Continúa la lista anterior
      prev.appendChild(li);
      block.remove();
    } else {
      const list = document.createElement(listTag);
      list.appendChild(li);
      block.replaceWith(list);
    }
    return li;
  }

  private toggleList(listTag: 'UL' | 'OL'): HTMLElement | null {
    const blocks = this.selectedBlocks();
    if (blocks.length === 0) return null;

    const firstLi = this.closestAnyTag(blocks[0], ['LI']);
    const parentList = firstLi?.parentElement ?? null;

    if (parentList && parentList.tagName === listTag) {
      // Misma lista -> desenvolver a párrafos
      return this.unwrapList(parentList);
    }
    if (parentList && (parentList.tagName === 'UL' || parentList.tagName === 'OL')) {
      // Cambiar tipo de lista
      const newList = document.createElement(listTag);
      while (parentList.firstChild) newList.appendChild(parentList.firstChild);
      parentList.replaceWith(newList);
      return firstLi;
    }
    // Envolver bloques en una lista nueva
    const list = document.createElement(listTag);
    blocks[0].parentNode?.insertBefore(list, blocks[0]);
    blocks.forEach((b) => {
      const li = document.createElement('li');
      while (b.firstChild) li.appendChild(b.firstChild);
      list.appendChild(li);
      b.remove();
    });
    return list.firstElementChild as HTMLElement;
  }

  private unwrapList(list: HTMLElement): HTMLElement | null {
    const frag = document.createDocumentFragment();
    Array.from(list.children).forEach((li) => {
      const p = document.createElement('p');
      while (li.firstChild) p.appendChild(li.firstChild);
      if (!p.firstChild) p.appendChild(document.createElement('br'));
      frag.appendChild(p);
    });
    const first = frag.firstElementChild as HTMLElement | null;
    list.replaceWith(frag);
    return first;
  }

  // Bloques que intersecta la selección (hojas, no contenedores)
  private selectedBlocks(range: Range | null = this.currentRange()): HTMLElement[] {
    if (!range) return [];
    const blocks = (Array.from(this.editor.querySelectorAll(BLOCK_TAGS.join(','))) as HTMLElement[])
      .filter((el) => range.intersectsNode(el));

    if (blocks.length === 0) {
      const b = this.blockOf(range.startContainer);
      return b ? [b] : [];
    }
    // Solo hojas (los que no contienen a otro bloque seleccionado)
    return blocks.filter((b) => !blocks.some((o) => o !== b && b.contains(o)));
  }

  private blockOf(node: Node | null): HTMLElement | null {
    return closestWithin(node, this.editor, (el) => isBlock(el));
  }

  //  Selección

  private currentRange(): Range | null {
    if (!this.editorEl()) return null;
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

  private offsetsOf(range: Range | null): TextOffsets | null {
    if (!range || !this.editor.contains(range.commonAncestorContainer)) return null;
    return {
      start: textOffset(this.editor, range.startContainer, range.startOffset),
      end: textOffset(this.editor, range.endContainer, range.endOffset),
    };
  }

  private restoreOffsets(sel: TextOffsets): void {
    this.selectRange(rangeFromOffsets(this.editor, sel.start, sel.end));
  }

  /** Guarda el cursor antes de que el foco salga del editor (ver PosicionGuardada). */
  private guardarPosicion(range: Range | null = this.currentRange()): PosicionGuardada | null {
    if (!range || !this.editor.contains(range.commonAncestorContainer)) return null;
    return { range: range.cloneRange(), offsets: this.offsetsOf(range) };
  }

  /** Rango de una posición guardada, sin seleccionarlo: el clon si sus nodos siguen en el editor, si no los offsets. */
  private rangoGuardado(pos: PosicionGuardada | null): Range | null {
    if (!pos) return null;
    const vivo = (n: Node) => n.isConnected && this.editor.contains(n);
    if (vivo(pos.range.startContainer) && vivo(pos.range.endContainer)) return pos.range.cloneRange();
    return pos.offsets ? rangeFromOffsets(this.editor, pos.offsets.start, pos.offsets.end) : null;
  }

  /** Vuelve a seleccionar una posición guardada y devuelve el rango (null si no había ninguna utilizable). */
  private restaurarPosicion(pos: PosicionGuardada | null): Range | null {
    const range = this.rangoGuardado(pos);
    if (!range) return null;
    this.selectRange(range);
    return this.currentRange();
  }

  private caretAtStart(el: HTMLElement): void {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const first = walker.nextNode();
    const range = document.createRange();
    if (first) range.setStart(first, 0);
    else range.setStart(el, 0);
    range.collapse(true);
    this.selectRange(range);
  }

  private caretAtEnd(el: HTMLElement): void {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    this.selectRange(range);
  }

  private placeCaretEnd(): void {
    this.editor.focus();
    this.caretAtEnd(this.editor);
  }

  // Posición para soltar contenido según las coordenadas del mouse
  private rangeFromPoint(x: number, y: number): Range | null {
    const doc = document as Document & {
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
    };
    let range: Range | null = null;
    if (doc.caretPositionFromPoint) {
      const pos = doc.caretPositionFromPoint(x, y);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
      }
    } else if (doc.caretRangeFromPoint) {
      range = doc.caretRangeFromPoint(x, y);
    }
    return range && this.editor.contains(range.startContainer) ? range : null;
  }

  private afterChange(): void {
    this.editor.focus();
    this.emit();
    this.recordHistory();
    this.cdr.markForCheck();
  }

  // Crea un párrafo editable inmediatamente después de `node` si no hay un
  // bloque editable, y coloca el caret dentro. Evita que el editor quede
  // "bloqueado" cuando una imagen/hr es el último elemento.
  private ensureBlockAfter(node: Node): void {
    let next = node.nextSibling;
    if (!isBlock(next)) {
      next = emptyParagraph();
      node.parentNode?.insertBefore(next, node.nextSibling);
    }
    this.caretAtStart(next as HTMLElement);
  }

  /**
   * Todo el contenido vive en bloques. El navegador escribe texto suelto en la raíz cuando el editor queda vacío
   * (al empezar, o tras Ctrl+A y borrar) y con texto suelto una imagen insertada partía el texto con un párrafo
   * nuevo, el cursor saltaba y lo siguiente caía en cualquier lado. Envuelve cada tramo inline en un <p>;
   * devuelve true si cambió algo (quien llama restaura el cursor).
   */
  private normalizarRaiz(): boolean {
    let cambio = false;
    let p: HTMLParagraphElement | null = null;
    for (const n of Array.from(this.editor.childNodes)) {
      const esBloque = isBlock(n) || (isElement(n) && STANDALONE_TAGS.includes(n.tagName));
      const vacio = n.nodeType === Node.TEXT_NODE && !(n as Text).data.trim();
      if (esBloque || n.nodeType === Node.COMMENT_NODE || (vacio && !p)) {
        p = null;
        continue;
      }
      if (!p) {
        p = document.createElement('p');
        this.editor.insertBefore(p, n);
        cambio = true;
      }
      p.appendChild(n);
    }
    if (!this.editor.firstChild) {
      this.editor.appendChild(emptyParagraph());
      cambio = true;
    }
    return cambio;
  }

  /**
   * Enter justo antes de una imagen: Chrome cree que el renglón nuevo está vacío (la imagen no es editable) y le
   * pone un <br> de relleno delante, que se veía como un renglón en blanco arriba de la imagen.
   */
  private quitarBrDeRelleno(): void {
    const bloque = this.blockOf(this.currentRange()?.startContainer ?? null);
    for (const b of [bloque, bloque?.previousElementSibling, bloque?.nextElementSibling]) {
      const br = b?.firstChild ?? null;
      const siguiente = br?.nextSibling ?? null;
      if (isElement(br) && br.tagName === 'BR' && isElement(siguiente) && isAtomic(siguiente)) br.remove();
    }
  }

  /** ¿Hay algo inline suelto en la raíz? (chequeo barato antes de calcular offsets en cada tecla) */
  private raizConInline(): boolean {
    if (!this.editor.firstChild) return true;
    for (let n: ChildNode | null = this.editor.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === Node.TEXT_NODE ? !!(n as Text).data.trim() : isElement(n) && !isBlock(n) && !STANDALONE_TAGS.includes(n.tagName)) return true;
    }
    return false;
  }

  // Asegura que el último hijo del editor sea un bloque editable, para poder
  // escribir debajo de imágenes/líneas insertadas al final.
  private normalizeTrailing(): void {
    const last = this.editor.lastChild;
    const editable = isBlock(last) || (isElement(last) && ['UL', 'OL'].includes(last.tagName));
    if (last && !editable) this.editor.appendChild(emptyParagraph());
  }

  //  Historial (snapshots de innerHTML + selección)

  private resetHistory(): void {
    this.history = [{ html: this.editor.innerHTML, sel: null }];
    this.historyIndex = 0;
  }

  private recordHistory(): void {
    clearTimeout(this.snapshotTimer);
    const html = this.editor.innerHTML;
    const sel = this.offsetsOf(this.currentRange());
    const current = this.history[this.historyIndex];
    if (current?.html === html) {
      current.sel = sel ?? current.sel;
      return;
    }
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({ html, sel });
    if (this.history.length > HISTORY_LIMIT) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  /**
   * El snapshot se toma 350 ms después de escribir: un Ctrl+Z antes de eso (p. ej. justo después de cortar) volvía
   * dos pasos atrás y se perdía lo último. Los cambios todavía sin registrar se registran antes de deshacer/rehacer.
   */
  private registrarPendiente(): void {
    if (this.editor.innerHTML !== this.history[this.historyIndex]?.html) this.recordHistory();
  }

  private restoreHistory(): void {
    const entry = this.history[this.historyIndex];
    this.deselectImg();
    this.editor.innerHTML = entry?.html ?? '';
    this.normalizarRaiz();
    this.emit();
    this.hideBubble();
    this.editor.focus();
    if (entry?.sel) this.restoreOffsets(entry.sel);
    else this.caretAtEnd(this.editor);
    this.cdr.markForCheck();
  }

  //  Bubble: visibilidad / posición

  private showBubbleAt(mode: BubbleMode, anchor: () => DOMRect | null): void {
    this.bubbleAnchor = anchor;
    if (this.bubbleMode !== mode) {
      this.bubbleMode = mode;
      this.cdr.detectChanges(); // renderiza el contenido nuevo para medirlo
    }
    this.repositionBubble();
  }

  private repositionBubble(): void {
    if (!this.bubbleMode || !this.bubbleAnchor) return;
    const rect = this.bubbleAnchor();
    if (rect) this.positionBubble(rect);
    else this.hideBubble();
    this.cdr.markForCheck();
  }

  // Coloca el bubble sobre `anchor`; si ahí taparía la toolbar, lo pasa debajo.
  // Las coordenadas son relativas al wrapper (position: relative).
  private positionBubble(anchor: DOMRect): void {
    const wrap = this.wrapperEl().nativeElement.getBoundingClientRect();
    const content = this.editor.getBoundingClientRect();
    const toolbarBottom = this.toolbarEl().nativeElement.getBoundingClientRect().bottom;

    // Zona visible del área editable (el editor tiene scroll propio y puede estar
    // recortado por la ventana, un diálogo o la toolbar fija)
    const visibleTop = Math.max(content.top, toolbarBottom, 0);
    const visibleBottom = Math.min(content.bottom, window.innerHeight);

    // Ancla fuera de la zona visible: no mostrar el bubble flotando sobre la toolbar
    if (anchor.bottom < visibleTop || anchor.top > visibleBottom) {
      this.hideBubble();
      return;
    }

    const bubble = this.bubble().elemento().nativeElement;
    const bw = bubble.offsetWidth || 280;
    const bh = bubble.offsetHeight || 40;

    const anchorTop = Math.max(anchor.top, visibleTop);
    const anchorBottom = Math.min(anchor.bottom, visibleBottom);

    const above = anchorTop - bh - BUBBLE_GAP;
    this.bubbleBelow = above < visibleTop + BUBBLE_EDGE;
    const top = this.bubbleBelow ? anchorBottom + BUBBLE_GAP : above;

    const center = anchor.left + anchor.width / 2 - wrap.left;
    const maxLeft = Math.max(BUBBLE_EDGE, wrap.width - bw - BUBBLE_EDGE);
    const left = Math.min(Math.max(center - bw / 2, BUBBLE_EDGE), maxLeft);

    this.bubbleTop = top - wrap.top;
    this.bubbleLeft = left;
    this.bubbleArrowX = Math.min(Math.max(center - left, 12), bw - 12);
  }

  private hideBubble(): void {
    this.bubbleMode = null;
    this.bubbleAnchor = null;
    this.showBubbleColors = false;
    this.linkEl = null;
    this.savedSel = null;
    this.cdr.markForCheck();
  }

  // Rectángulo visible de un rango; un caret en una línea vacía no tiene tamaño
  private rangeRect(range: Range | null): DOMRect | null {
    if (!range) return null;
    const rect = range.getBoundingClientRect();
    if (rect.width || rect.height) return rect;
    // Chrome a veces devuelve rectángulos en cero (p. ej. el cursor justo después de un emoji al final del renglón):
    // tomados al pie de la letra el bubble quedaba "fuera de la vista" y se ocultaba apenas se abría (Ctrl+K no
    // mostraba nada). Se ignoran y se usa el bloque.
    const util = Array.from(range.getClientRects()).find((r) => r.height || r.top || r.left);
    if (util) return util;
    const nodo = range.startContainer;
    return (this.blockOf(nodo) ?? (isElement(nodo) ? nodo : nodo.parentElement))?.getBoundingClientRect() ?? null;
  }

  //  Helpers

  private isUrl(text: string): boolean {
    if (!text || /\s/.test(text)) return false;
    if (/^(https?:\/\/|mailto:)/i.test(text)) return true;
    return /^([a-z0-9-]+\.)+[a-z]{2,}([\/?#][^\s]*)?$/i.test(text);
  }

  private normalizeUrl(url: string): string {
    return /^(https?:|mailto:|\/|#)/i.test(url) ? url : `https://${url}`;
  }

  private closestAnyTag(node: Node | null, tags: string[]): HTMLElement | null {
    if (!this.editorEl()) return null;
    return closestWithin(node, this.editor, (el) => tags.includes(el.tagName));
  }
}

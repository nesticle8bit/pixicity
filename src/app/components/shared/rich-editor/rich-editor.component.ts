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

  readonly headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  readonly colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#ffffff',
    '#ff0000', '#ff4500', '#ff8c00', '#ffd700', '#adff2f', '#008000', '#00ced1', '#0000ff',
    '#8b008b', '#ff1493', '#ff69b4', '#a52a2a', '#d2691e', '#f4a460', '#deb887', '#2e8b57',
  ];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private pendingValue = '';
  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    if (this.pendingValue) {
      this.editorEl.nativeElement.innerHTML = this.pendingValue;
    }
  }

  ngOnDestroy(): void {}

  // ControlValueAccessor
  writeValue(value: string): void {
    const html = value || '';
    if (this.initialized && this.editorEl) {
      this.editorEl.nativeElement.innerHTML = html;
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
    this.onChange(this.editorEl.nativeElement.innerHTML);
  }

  onBlur(): void {
    this.onTouched();
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

  //  Toolbar commands

  private exec(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.editorEl.nativeElement.focus();
    this.onInput();
  }

  bold(): void         { this.exec('bold'); }
  italic(): void       { this.exec('italic'); }
  underline(): void    { this.exec('underline'); }
  strikeThrough(): void { this.exec('strikeThrough'); }

  toggleCode(): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const anchor = sel.anchorNode;
    const parentCode = this.closestTag(anchor, 'CODE');

    if (parentCode) {
      // Unwrap
      const parent = parentCode.parentNode!;
      while (parentCode.firstChild) parent.insertBefore(parentCode.firstChild, parentCode);
      parent.removeChild(parentCode);
    } else {
      const range = sel.getRangeAt(0);
      const code = document.createElement('code');
      try {
        range.surroundContents(code);
      } catch {
        code.appendChild(range.extractContents());
        range.insertNode(code);
      }
    }
    this.editorEl.nativeElement.focus();
    this.onInput();
  }

  toggleBlockquote(): void { this.exec('formatBlock', 'blockquote'); }

  orderedList(): void   { this.exec('insertOrderedList'); }
  bulletList(): void    { this.exec('insertUnorderedList'); }

  formatHeading(tag: string): void {
    this.exec('formatBlock', tag);
    this.showHeadingMenu = false;
  }

  insertLink(): void {
    const url = prompt('URL del enlace:');
    if (url) this.exec('createLink', url);
  }

  insertImage(): void {
    const url = prompt('URL de la imagen:');
    if (url) this.exec('insertImage', url);
  }

  setColor(color: string): void {
    this.exec('foreColor', color);
    this.showColorPicker = false;
  }

  alignLeft(): void    { this.exec('justifyLeft'); }
  alignCenter(): void  { this.exec('justifyCenter'); }
  alignRight(): void   { this.exec('justifyRight'); }
  alignJustify(): void { this.exec('justifyFull'); }

  horizontalRule(): void { this.exec('insertHorizontalRule'); }
  removeFormat(): void   { this.exec('removeFormat'); }
  undo(): void           { this.exec('undo'); }
  redo(): void           { this.exec('redo'); }

  //  Helpers

  private closestTag(node: Node | null, tag: string): HTMLElement | null {
    let current: Node | null = node;
    while (current) {
      if (current instanceof HTMLElement && current.tagName === tag) return current;
      current = current.parentNode;
    }
    return null;
  }
}

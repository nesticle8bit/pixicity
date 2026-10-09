import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { RichEditorComponent } from './rich-editor.component';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

describe('RichEditorComponent', () => {
  let fixture: ComponentFixture<RichEditorComponent>;
  let component: RichEditorComponent;
  let editor: HTMLDivElement;
  let emitted: string[];
  let upload$: Subject<string>;
  let notifications: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    upload$ = new Subject<string>();
    notifications = jasmine.createSpyObj('NotificationService', ['warning', 'error', 'success']);

    await TestBed.configureTestingModule({
    imports: [RichEditorComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        { provide: IHttpFotosService, useValue: { uploadImage: () => upload$ } },
        { provide: NotificationService, useValue: notifications },
    ],
}).compileComponents();

    fixture = TestBed.createComponent(RichEditorComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.registerOnChange((v) => emitted.push(v));
    fixture.detectChanges();
    editor = fixture.nativeElement.querySelector('.rich-editor__content');
    document.body.appendChild(fixture.nativeElement);
  });

  afterEach(() => fixture.nativeElement.remove());

  const setHtml = (markup: string) => component.writeValue(markup);

  // Selecciona `text` (la n-ésima aparición) dentro del editor
  function select(text: string, collapseToEnd = false): void {
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
      const i = n.data.indexOf(text);
      if (i >= 0) {
        const range = document.createRange();
        range.setStart(n, collapseToEnd ? i + text.length : i);
        range.setEnd(n, i + text.length);
        editor.focus();
        const sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
    }
    throw new Error(`Texto no encontrado: ${text}`);
  }

  function caretIn(el: Element, offset = 0): void {
    const range = document.createRange();
    range.setStart(el.firstChild ?? el, offset);
    range.collapse(true);
    editor.focus();
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
  }

  const key = (k: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
    editor.dispatchEvent(event);
    return event;
  };

  const content = () => editor.innerHTML.replace(/​/g, '');

  describe('valor', () => {
    it('un editor vacío emite cadena vacía (para que required funcione)', () => {
      setHtml('<p>hola</p>');
      editor.innerHTML = '<p><br></p>';
      component.onInput();
      expect(emitted.pop()).toBe('');
    });

    it('setDisabledState bloquea la edición', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      expect(editor.getAttribute('contenteditable')).toBe('false');
      component.setDisabledState(false);
      fixture.detectChanges();
      expect(editor.getAttribute('contenteditable')).toBe('true');
    });
  });

  describe('formato inline', () => {
    it('quitar negrita de una parte divide el elemento', () => {
      setHtml('<p><strong>hola mundo</strong></p>');
      select('mundo');
      component.bold();
      expect(content()).toBe('<p><strong>hola </strong>mundo</p>');
    });

    it('negrita sobre varios párrafos envuelve cada uno sin romper los bloques', () => {
      setHtml('<p>uno</p><p>dos</p>');
      const range = document.createRange();
      range.setStart(editor.querySelector('p')!.firstChild!, 1);
      range.setEnd(editor.querySelectorAll('p')[1].firstChild!, 2);
      editor.focus();
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);

      component.bold();
      expect(content()).toBe('<p>u<strong>no</strong></p><p><strong>do</strong>s</p>');
    });

    it('selección mixta: aplica la marca a todo sin anidarla', () => {
      setHtml('<p>a<strong>b</strong>c</p>');
      select('a');
      const range = window.getSelection()!.getRangeAt(0);
      range.setEnd(editor.querySelector('p')!.lastChild!, 1);
      component.bold();
      expect(content()).toBe('<p><strong>abc</strong></p>');
    });

    it('eliminar formato conserva párrafos y enlaces', () => {
      setHtml('<p><strong>uno</strong></p><p><em><a href="https://x.com">dos</a></em></p>');
      const range = document.createRange();
      range.selectNodeContents(editor);
      editor.focus();
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);

      component.removeFormat();
      expect(content()).toBe('<p>uno</p><p><a href="https://x.com">dos</a></p>');
    });

    it('resaltado y "sin color"', () => {
      setHtml('<p>hola</p>');
      select('hola');
      component.applyStyle('backgroundColor', '#fff59d');
      expect(editor.querySelector('span')!.style.backgroundColor).toBeTruthy();

      select('hola');
      component.applyStyle('backgroundColor', null);
      expect(content()).toBe('<p>hola</p>');
    });
  });

  describe('atajos markdown', () => {
    it('"# " convierte el párrafo en encabezado', () => {
      setHtml('<p>#</p>');
      caretIn(editor.querySelector('p')!, 1);
      expect(key(' ').defaultPrevented).toBeTrue();
      expect(editor.querySelector('h1')).not.toBeNull();
    });

    it('"- " crea una lista de viñetas', () => {
      setHtml('<p>-</p>');
      caretIn(editor.querySelector('p')!, 1);
      key(' ');
      expect(editor.querySelector('ul > li')).not.toBeNull();
    });

    it('**texto** se convierte en negrita al cerrar', () => {
      setHtml('<p>a **fuerte*</p>');
      select('a **fuerte*', true);
      expect(key('*').defaultPrevented).toBeTrue();
      expect(content()).toBe('<p>a <strong>fuerte</strong></p>');
    });

    it('`código` se convierte en código inline', () => {
      setHtml('<p>usa `npm</p>');
      select('usa `npm', true);
      key('`');
      expect(content()).toBe('<p>usa <code>npm</code></p>');
    });
  });

  describe('listas y citas', () => {
    it('Enter en un ítem vacío sale de la lista', () => {
      setHtml('<ul><li>uno</li><li><br></li></ul>');
      caretIn(editor.querySelectorAll('li')[1]);
      expect(key('Enter').defaultPrevented).toBeTrue();
      expect(content()).toBe('<ul><li>uno</li></ul><p><br></p>');
    });

    it('Tab anida el ítem bajo el anterior y Shift+Tab lo sube', () => {
      setHtml('<ul><li>uno</li><li>dos</li></ul>');
      select('dos');
      key('Tab');
      expect(content()).toBe('<ul><li>uno<ul><li>dos</li></ul></li></ul>');

      select('dos');
      key('Tab', { shiftKey: true });
      expect(content()).toBe('<ul><li>uno</li><li>dos</li></ul>');
    });

    it('Enter en una cita vacía la convierte en párrafo', () => {
      setHtml('<blockquote><br></blockquote>');
      caretIn(editor.querySelector('blockquote')!);
      key('Enter');
      expect(content()).toBe('<p><br></p>');
    });
  });

  describe('historial', () => {
    it('deshacer restaura el contenido y la selección', () => {
      setHtml('<p>hola mundo</p>');
      select('mundo');
      component.bold();
      expect(content()).toContain('<strong>');

      component.undo();
      expect(content()).toBe('<p>hola mundo</p>');
      component.redo();
      expect(window.getSelection()!.toString()).toBe('mundo');
    });
  });

  describe('pegar', () => {
    function paste(data: Record<string, string>): void {
      const dt = new DataTransfer();
      Object.entries(data).forEach(([type, value]) => dt.setData(type, value));
      editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    }

    it('limpia el HTML pegado', () => {
      setHtml('<p>x</p>');
      select('x', true);
      paste({ 'text/html': '<span style="font-weight:bold;color:red" class="c1">hola</span>', 'text/plain': 'hola' });
      expect(content()).toBe('<p>x<strong>hola</strong></p>');
    });

    it('párrafos pegados dividen el párrafo actual', () => {
      setHtml('<p>ab</p>');
      caretIn(editor.querySelector('p')!, 1);
      paste({ 'text/plain': 'uno\ndos' });
      expect(content()).toBe('<p>a</p><p>uno</p><p>dos</p><p>b</p>');
    });

    it('una URL pegada sobre texto seleccionado crea un enlace', () => {
      setHtml('<p>mira esto</p>');
      select('esto');
      paste({ 'text/plain': 'https://pixicity.com' });
      const a = editor.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('https://pixicity.com');
      expect(a.textContent).toBe('esto');
    });
  });

  describe('imágenes', () => {
    it('rechaza archivos que no son imágenes permitidas', () => {
      setHtml('<p>x</p>');
      component['uploadImages']([new File(['a'], 'a.txt', { type: 'text/plain' })], null);
      expect(notifications.warning).toHaveBeenCalled();
      expect(editor.querySelector('.rich-editor__uploading')).toBeNull();
    });

    it('muestra un placeholder mientras sube y lo reemplaza por la imagen', () => {
      setHtml('<p>x</p>');
      select('x', true);
      component['uploadImages']([new File(['a'], 'a.png', { type: 'image/png' })], null);
      expect(editor.querySelector('.rich-editor__uploading')).not.toBeNull();
      expect(emitted[emitted.length - 1]).not.toContain('Subiendo');

      upload$.next('/images/fotos/u/a.jpg');
      expect(editor.querySelector('.rich-editor__uploading')).toBeNull();
      expect(emitted[emitted.length - 1]).toContain('/images/fotos/u/a.jpg');
    });
  });
});

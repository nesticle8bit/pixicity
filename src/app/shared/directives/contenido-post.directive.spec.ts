import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ContenidoPostDirective } from './contenido-post.directive';

@Component({
  imports: [ContenidoPostDirective],
  template: `<div class="contenido" [appContenidoPost]="html()"><span [innerHTML]="html()"></span></div>`,
})
class AnfitrionComponent {
  html = signal('');
}

describe('ContenidoPostDirective', () => {
  const VIDEO =
    '<figure class="video-yt"><a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&amp;t=42s">'
    + '<img src="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" alt="Video de YouTube"></a></figure>';

  function crear(html: string): HTMLElement {
    const fixture = TestBed.createComponent(AnfitrionComponent);
    fixture.componentInstance.html.set(html);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('el video llega como miniatura enlazada (el [innerHTML] lo conserva)', () => {
    const el = crear(VIDEO);
    expect(el.querySelector('figure.video-yt a img')).not.toBeNull();
    expect(el.querySelector('iframe')).toBeNull();
  });

  it('al hacer clic en la miniatura la cambia por el reproductor', () => {
    const el = crear(VIDEO);
    const clic = new MouseEvent('click', { bubbles: true, cancelable: true });
    el.querySelector('img')!.dispatchEvent(clic);

    expect(clic.defaultPrevented).toBeTrue();
    const iframe = el.querySelector<HTMLIFrameElement>('figure.video-yt iframe')!;
    expect(iframe.src).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&start=42');
    expect(el.querySelector('figure.video-yt a')).toBeNull();
  });

  it('Ctrl+clic deja abrir el video en YouTube', () => {
    const el = crear(VIDEO);
    const clic = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    el.querySelector('a')!.addEventListener('click', (e) => e.preventDefault()); // sin navegar en la prueba
    el.querySelector('img')!.dispatchEvent(clic);
    expect(el.querySelector('iframe')).toBeNull();
  });
});

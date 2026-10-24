import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, output, viewChild } from '@angular/core';

interface TurnstileApi {
  render(el: HTMLElement, opciones: Record<string, unknown>): string;
  remove(id: string): void;
  reset(id: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let cargaScript: Promise<void> | null = null;

/** Carga el script de Cloudflare una sola vez, recién cuando hace falta un captcha. */
function cargarTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  cargaScript ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      cargaScript = null;
      reject(new Error('No se pudo cargar el captcha'));
    };
    document.head.appendChild(script);
  });
  return cargaScript;
}

/**
 * Captcha de Cloudflare Turnstile. Emite el token al resolverse y '' cuando vence o falla (hay que pedir otro).
 * Solo se dibuja en el navegador.
 */
@Component({
  selector: 'app-turnstile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #contenedor class="turnstile"></div>`,
  styles: `
    :host { display: block; }
    .turnstile { min-height: 65px; max-width: 100%; }
    .turnstile--compacto { min-height: 140px; }
  `,
})
export class TurnstileComponent {
  readonly siteKey = input.required<string>();
  readonly token = output<string>();

  private readonly contenedor = viewChild.required<ElementRef<HTMLElement>>('contenedor');
  private widgetId: string | null = null;

  constructor() {
    afterNextRender(async () => {
      try {
        await cargarTurnstile();
      } catch {
        return;
      }
      // El widget normal mide 300 px fijos: en un celular se salía del formulario (scroll horizontal).
      const el = this.contenedor().nativeElement;
      const compacto = el.clientWidth > 0 && el.clientWidth < 300;
      el.classList.toggle('turnstile--compacto', compacto);
      this.widgetId =
        window.turnstile?.render(el, {
          sitekey: this.siteKey(),
          language: 'es',
          size: compacto ? 'compact' : 'normal',
          callback: (t: string) => this.token.emit(t),
          'expired-callback': () => this.token.emit(''),
          'error-callback': () => this.token.emit(''),
        }) ?? null;
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.widgetId) window.turnstile?.remove(this.widgetId);
    });
  }

  /** Pide un captcha nuevo (un token sirve una sola vez: tras un error del registro hay que renovarlo). */
  reiniciar(): void {
    if (this.widgetId) window.turnstile?.reset(this.widgetId);
    this.token.emit('');
  }
}

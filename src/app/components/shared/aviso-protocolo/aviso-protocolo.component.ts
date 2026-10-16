import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

const CLAVE = 'pixicity.protocoloVisto';

/**
 * Recordatorio del protocolo al publicar por primera vez (post o shout). Se muestra hasta que el usuario lo cierra
 * ("Entendido"); a partir de ahí no vuelve a aparecer en ese navegador.
 */
@Component({
  selector: 'app-aviso-protocolo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (visible()) {
    <aside class="ap" role="note" aria-label="Antes de publicar">
      <i class="ti ti-shield-check ap__icono" aria-hidden="true"></i>
      <div class="ap__cuerpo">
        <strong>Antes de publicar tu primer {{ que() }}</strong>
        <ul>
          <li>Nada de spam, publicidad ni sorteos de puntos.</li>
          <li>Respeta a los demás: sin insultos, acoso ni discriminación.</li>
          <li>Sin enlaces de descarga que infrinjan derechos de autor.</li>
        </ul>
        <span>Lee el <a routerLink="/paginas/protocolo" target="_blank">protocolo completo</a>: el contenido que no lo cumpla se elimina.</span>
      </div>
      <button type="button" class="ap__ok" (click)="entendido()">Entendido</button>
    </aside>
    }
  `,
  styles: `
    .ap {
      display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding: 12px 14px;
      border: 1px solid #cfe3ef; border-radius: 12px; background: #f4f9fc; font-size: 0.9rem; color: #31414d;
    }
    .ap__icono { font-size: 1.6rem; color: #006595; }
    .ap__cuerpo { flex: 1; min-width: 0; }
    .ap__cuerpo ul { margin: 4px 0; padding-left: 18px; }
    .ap__cuerpo a { font-weight: 600; color: #006595; }
    .ap__ok {
      flex-shrink: 0; padding: 6px 12px; border: 0; border-radius: 8px;
      background: #006595; font-weight: 700; color: #fff; cursor: pointer;
    }
    @media (max-width: 575.98px) { .ap { flex-wrap: wrap; } .ap__ok { margin-left: auto; } }
  `,
})
export class AvisoProtocoloComponent {
  /** "post" o "shout": para el título. */
  readonly que = input<'post' | 'shout'>('shout');

  private readonly navegador = isPlatformBrowser(inject(PLATFORM_ID));
  readonly visible = signal(this.navegador && !this.leer());

  entendido(): void {
    this.visible.set(false);
    try {
      localStorage.setItem(CLAVE, '1');
    } catch {
      // Sin almacenamiento (modo privado): solo se oculta en esta vista.
    }
  }

  private leer(): boolean {
    try {
      return localStorage.getItem(CLAVE) === '1';
    } catch {
      return false;
    }
  }
}

import { Component, input, inject } from '@angular/core';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { enNavegador } from '../../../shared/helpers/plataforma';

type RedSocial = 'facebook' | 'twitter' | 'whatsapp';

@Component({
    selector: 'app-share-buttons',
    templateUrl: './share-buttons.component.html',
    styleUrls: ['./share-buttons.component.scss'],
})
export class ShareButtonsComponent {
  private notificationService = inject(NotificationService);

  /** Título que acompaña al enlace (Twitter y WhatsApp). */
  readonly titulo = input<string>('');
  /** URL a compartir; por defecto la página actual. */
  readonly url = input<string>();

  /** El menú nativo (Telegram, Instagram, etc.) existe sobre todo en móviles; en escritorio el botón no se muestra. */
  readonly puedeCompartirNativo = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  private get enlace(): string {
    return this.url() || (enNavegador() ? window.location.href : '');
  }

  compartir(red: RedSocial): void {
    const url = encodeURIComponent(this.enlace);
    const texto = encodeURIComponent(this.titulo() || '');

    const urls: Record<RedSocial, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${texto}`,
      whatsapp: `https://wa.me/?text=${texto ? texto + '%20' : ''}${url}`,
    };

    window.open(urls[red], '_blank', 'noopener,width=640,height=480,scrollbars=yes');
  }

  compartirNativo(): void {
    navigator.share({ title: this.titulo() || document.title, url: this.enlace }).catch((error: unknown) => {
      // AbortError = el usuario cerró el menú: no es un error.
      if ((error as DOMException)?.name !== 'AbortError') {
        this.copiarEnlace();
      }
    });
  }

  copiarEnlace(): void {
    const enlace = this.enlace;

    const copiado = () => this.notificationService.success('Enlace copiado al portapapeles', 'Compartir');
    const fallo = () => this.notificationService.error('No se pudo copiar el enlace', 'Compartir');

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(enlace).then(copiado, () => (this.copiarConTextarea(enlace) ? copiado() : fallo()));
    } else {
      this.copiarConTextarea(enlace) ? copiado() : fallo();
    }
  }

  // Navegadores sin API de portapapeles (o en http): copia desde un textarea temporal.
  private copiarConTextarea(texto: string): boolean {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(area);
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { enNavegador } from '../../shared/helpers/plataforma';
import { ConfirmarService } from './confirmar.service';

/** Avisos al usuario. En el render del servidor (SSR para bots) no hay a quién mostrarlos: no hacen nada. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastr = inject(ToastrService);
  private confirmar = inject(ConfirmarService);
  private readonly activo = enNavegador();

  success(message: string, title?: string): void {
    if (this.activo) this.toastr.success(message, title);
  }

  error(message: string, title?: string): void {
    if (this.activo) this.toastr.error(message, title);
  }

  info(message: string, title?: string): void {
    if (this.activo) this.toastr.info(message, title);
  }

  warning(message: string, title?: string): void {
    if (this.activo) this.toastr.warning(message, title);
  }

  /** Atajos al ConfirmarService (diálogo propio): para título, textos de botones, etc., usar ese directamente. */
  confirm(message: string): Promise<boolean> {
    return this.confirmar.confirmar(message);
  }

  prompt(message: string): Promise<string | null> {
    return this.confirmar.pedirTexto(message);
  }
}

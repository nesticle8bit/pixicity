import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { enNavegador } from '../../shared/helpers/plataforma';

/** Avisos al usuario. En el render del servidor (SSR para bots) no hay a quién mostrarlos: no hacen nada. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastr = inject(ToastrService);
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

  confirm(message: string): boolean {
    return this.activo && window.confirm(message);
  }

  prompt(message: string): string | null {
    return this.activo ? window.prompt(message) : null;
  }
}

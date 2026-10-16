import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { NotificationService } from './notification.service';

/**
 * Las secciones públicas (/mi, shouts, comentarios) se pueden leer sin cuenta; interactuar (me gusta, comentar,
 * seguir...) lleva al login y, al entrar, vuelve a la misma página.
 */
@Injectable({ providedIn: 'root' })
export class SesionRequeridaService {
  private readonly router = inject(Router);
  private readonly securityService = inject(IHttpSecurityService);
  private readonly notificationService = inject(NotificationService);

  get haySesion(): boolean {
    const actual = this.securityService.getCurrentUser();
    return !!(actual?.usuario && actual?.token);
  }

  /** true si hay sesión; si no, redirige al login (con returnUrl) y devuelve false. */
  exigir(motivo = 'Inicia sesión para continuar'): boolean {
    if (this.haySesion) return true;
    this.notificationService.info(motivo, 'Iniciar sesión');
    this.irALogin();
    return false;
  }

  irALogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }
}

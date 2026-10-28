import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

/**
 * Aviso arriba de la página mientras el usuario no confirmó su correo. Según la configuración no puede publicar,
 * o solo tiene que esperar unos minutos desde el registro (el API lo decide y lo explica en el error).
 * Ofrece reenviar el enlace y corregir el correo. Al aparecer consulta el estado al API una vez, por si ya lo
 * confirmó desde otro dispositivo.
 */
@Component({
  selector: 'app-aviso-email',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (visible()) {
    <div class="aviso-email container" role="status">
      <div class="aviso-email__contenido">
        <i class="ti ti-mail-exclamation aviso-email__icono" aria-hidden="true"></i>
        <p class="aviso-email__texto">
          <strong>Confirma tu correo para tener la cuenta completa.</strong>
          Te enviamos un enlace{{ email() ? ' a ' + email() : '' }}. Revisa también la carpeta de spam.
        </p>
        <div class="aviso-email__acciones">
          <button type="button" class="aviso-email__boton" (click)="reenviar()" [disabled]="enviando() || enviado()">
            {{ enviado() ? 'Enviado' : enviando() ? 'Enviando…' : 'Reenviar correo' }}
          </button>
          <a routerLink="/cuenta" class="aviso-email__enlace">Cambiar correo</a>
        </div>
      </div>
    </div>
    }
  `,
  styles: `
    /* Mismo ancho y bordes laterales que la barra de noticias (app-main-ultimas-noticias). */
    .aviso-email {
      background: light-dark(#fff8e6, #483c1b);
      border-bottom: 1px solid light-dark(#f1d58a, #8c7535);
      border-left: 1px solid light-dark(#ccc, #4e575f);
      border-right: 1px solid light-dark(#ccc, #4e575f);
      color: light-dark(#4a3a12, #edddb6);
    }
    .aviso-email__contenido {
      display: flex;
      align-items: center;
      gap: 10px 14px;
      flex-wrap: wrap;
      padding: 10px 0;
    }
    .aviso-email__icono { font-size: 1.4rem; color: light-dark(#9a6b00, #f2d38c); }
    .aviso-email__texto { flex: 1; min-width: 220px; margin: 0; font-size: 0.86rem; line-height: 1.4; }
    .aviso-email__acciones { display: flex; align-items: center; gap: 12px; }
    .aviso-email__boton {
      padding: 6px 14px;
      border: 1px solid #006595;
      border-radius: 8px;
      background: #006595;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      &:hover:not(:disabled) { background: #00527a; }
      &:disabled { cursor: default; opacity: 0.7; }
      &:focus-visible { outline: 2px solid #006595; outline-offset: 2px; }
    }
    .aviso-email__enlace { font-size: 0.82rem; font-weight: 700; color: light-dark(#00527a, #9dd8f4); }
  `,
})
export class AvisoEmailComponent {
  private readonly securityService = inject(IHttpSecurityService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly sesion = toSignal(this.securityService.getCurrentUserAsObservable());
  readonly visible = computed(() => this.sesion()?.usuario?.emailConfirmado === false);
  readonly email = signal('');
  readonly enviando = signal(false);
  readonly enviado = signal(false);
  private consultado = false;

  constructor() {
    effect(() => {
      if (!this.visible() || this.consultado) return;
      this.consultado = true;
      this.securityService
        .getEstadoEmail()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (estado) => {
            this.email.set(estado.email);
            if (estado.emailConfirmado) this.securityService.marcarEmailConfirmado(true);
          },
          error: () => {},
        });
    });
  }

  reenviar(): void {
    this.enviando.set(true);
    this.securityService
      .reenviarConfirmacion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ok) => {
          this.enviando.set(false);
          if (ok) {
            this.enviado.set(true);
            this.notificationService.success('Te enviamos un correo nuevo. El enlace vence en 24 horas.', 'Correo');
          }
        },
        error: () => this.enviando.set(false),
      });
  }
}

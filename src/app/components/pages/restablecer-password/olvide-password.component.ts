import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';

/** /olvide-password: pide el correo y envía el enlace para elegir una contraseña nueva. */
@Component({
  selector: 'app-olvide-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // FormsModule: convierte el <form> en ngForm (ngSubmit sin recargar la página).
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  styleUrl: './cuenta-tarjeta.scss',
  template: `
    <div class="container container--home">
      @if (!enviado()) {
        <form class="tarjeta" (ngSubmit)="enviar()">
          <h1 class="tarjeta__titulo">¿Olvidaste tu contraseña?</h1>
          <p class="tarjeta__texto">Escribe el correo de tu cuenta y te enviamos un enlace para elegir una nueva.</p>
          <label class="tarjeta__campo">
            Correo electrónico
            <input type="email" [formControl]="email" autocomplete="email" required />
          </label>
          @if (error()) {
            <p class="tarjeta__error" role="alert">{{ error() }}</p>
          }
          <button type="submit" class="tarjeta__boton" [disabled]="email.invalid || enviando()">
            {{ enviando() ? 'Enviando…' : 'Enviar enlace' }}
          </button>
          <a routerLink="/login" class="tarjeta__enlace">Volver a iniciar sesión</a>
        </form>
      } @else {
        <section class="tarjeta" aria-live="polite">
          <i class="ti ti-mail-check tarjeta__icono" aria-hidden="true"></i>
          <h1 class="tarjeta__titulo">Revisa tu correo</h1>
          <p class="tarjeta__texto">
            Si {{ email.value }} es el correo de una cuenta, te llegará un enlace para elegir una contraseña nueva.
            Vence en 1 hora; revisa también la carpeta de spam.
          </p>
          <a routerLink="/login" class="tarjeta__boton">Volver a iniciar sesión</a>
        </section>
      }
    </div>
  `,
})
export class OlvidePasswordComponent {
  private readonly securityService = inject(IHttpSecurityService);
  private readonly destroyRef = inject(DestroyRef);

  readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  readonly enviando = signal(false);
  readonly enviado = signal(false);
  readonly error = signal('');

  constructor() {
    inject(DisplayComponentService).setDisplay({ mainMenu: true, footer: true, searchFooter: false, submenu: false, background: '' });
    inject(SEOService).setSEO({ title: 'Olvidé mi contraseña', description: '', type: 'website', imageURL: '', tags: [], noIndex: true });
  }

  enviar(): void {
    if (this.email.invalid || this.enviando()) return;
    this.enviando.set(true);
    this.error.set('');
    this.securityService
      .solicitarRestablecimiento(this.email.value.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.enviado.set(true);
        },
        error: (e: unknown) => {
          this.enviando.set(false);
          this.error.set(e instanceof Error ? e.message : 'No se pudo enviar el correo');
        },
      });
  }
}

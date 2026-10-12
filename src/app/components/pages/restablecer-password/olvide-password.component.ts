import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';

/** /olvide-password: pide el correo y envía el enlace para elegir una contraseña nueva. Mismo diseño que /login. */
@Component({
  selector: 'app-olvide-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // FormsModule: convierte el <form> en ngForm (ngSubmit sin recargar la página).
  imports: [FormsModule, ReactiveFormsModule, RouterLink, MatButton],
  styleUrls: ['../login/login.component.scss'],
  template: `
    <div class="container container--home bg-login mt-3">
      <div class="row p-4 bg-white">
        <div class="col-12 col-sm-8 text-center main-login--head">
          <section>
            <h1>¿Olvidaste tu contraseña?</h1>
            <p>Te enviamos un enlace a tu correo para que elijas una nueva</p>
          </section>

          <div class="dot--ccc">
            <span class="w200">Recuperar acceso</span>
          </div>

          @if (!enviado()) {
            <form (ngSubmit)="enviar()" class="login_box mx-auto">
              @if (error()) {
                <div class="alert alert-danger p-3 mb-3" role="alert">
                  <span class="font-w-700">{{ error() }}</span>
                </div>
              }

              <div class="mb-3">
                <label for="olvide-email">Correo electrónico</label>
                <input id="olvide-email" type="email" [formControl]="email" autocomplete="email" class="form-control mx-auto" />
              </div>

              <div class="dot--ccc">
                <input type="submit" class="submit-btn" [value]="enviando() ? 'Enviando…' : 'Enviar enlace'"
                  [disabled]="email.invalid || enviando()" />
              </div>
              <p class="text-center mt-2 mb-0">
                <a routerLink="/login">Volver a iniciar sesión</a>
              </p>
            </form>
          } @else {
            <div class="login_box mx-auto" aria-live="polite">
              <div class="alert alert-success p-3 mb-3">
                <h2 class="h5 font-w-700">Revisa tu correo</h2>
                <p class="mb-0">
                  Si {{ email.value }} es el correo de una cuenta, te llegará un enlace para elegir una contraseña nueva.
                  Vence en 1 hora; revisa también la carpeta de spam.
                </p>
              </div>
              <p class="text-center mt-2 mb-0">
                <a routerLink="/login">Volver a iniciar sesión</a>
              </p>
            </div>
          }
        </div>

        <div class="col-12 col-sm-4">
          <div class="text-center">
            <img loading="lazy" decoding="async" src="/assets/images/login-bg.gif" alt="" width="300" height="247">
            <div class="dot--ccc mt-0">
              <span class="w200">¿Ya la recordaste?</span>
            </div>
            <button [routerLink]="['/login']" type="button" mat-flat-button color="primary">
              Identificarme
            </button>
            <div class="dot--ccc">
              <span class="w200">¿No tienes cuenta?</span>
            </div>
            <button [routerLink]="['/registro']" type="button" mat-flat-button color="primary">
              Registrate
            </button>
          </div>
        </div>
      </div>
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
    // Igual que /login: sin el menú principal.
    inject(DisplayComponentService).setDisplay({ mainMenu: false, footer: true, searchFooter: false, submenu: false, background: '' });
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

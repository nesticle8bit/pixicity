import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';

/** Destino del enlace del correo: /restablecer-password?token=... */
@Component({
  selector: 'app-restablecer-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // FormsModule: convierte el <form> en ngForm (ngSubmit sin recargar la página).
  imports: [FormsModule, ReactiveFormsModule, RouterLink, MatButton],
  // Mismo diseño que /login y /olvide-password.
  styleUrls: ['../login/login.component.scss'],
  template: `
    <div class="container container--home bg-login mt-3">
      <div class="row p-4 bg-white">
        <div class="col-12 col-sm-8 text-center main-login--head">
          @if (!listo()) {
            <section>
              <h1>Elige una contraseña nueva</h1>
              <p>Al cambiarla cerramos las sesiones abiertas en otros dispositivos</p>
            </section>

            <div class="dot--ccc">
              <span class="w200">Nueva contraseña</span>
            </div>

            <form (ngSubmit)="guardar()" class="login_box mx-auto">
              @if (error()) {
                <div class="alert alert-danger p-3 mb-3" role="alert">
                  <span class="font-w-700">{{ error() }}</span>
                </div>
              }
              <div class="mb-3">
                <label for="restablecer-password">Contraseña nueva</label>
                <input id="restablecer-password" type="password" [formControl]="password" autocomplete="new-password"
                  maxlength="100" class="form-control mx-auto" />
              </div>
              <div class="mb-3">
                <label for="restablecer-repetir">Repite la contraseña</label>
                <input id="restablecer-repetir" type="password" [formControl]="repetir" autocomplete="new-password"
                  class="form-control mx-auto" />
              </div>
              <div class="dot--ccc">
                <input type="submit" class="submit-btn" [value]="guardando() ? 'Guardando…' : 'Cambiar contraseña'"
                  [disabled]="guardando()" />
              </div>
              <p class="text-center mt-2 mb-0">
                <a routerLink="/olvide-password">Pedir un enlace nuevo</a>
              </p>
            </form>
          } @else {
            <section aria-live="polite">
              <h1>¡Contraseña cambiada!</h1>
              <p>Ya puedes iniciar sesión con tu contraseña nueva</p>
            </section>
            <div class="dot--ccc">
              <span class="w200">Listo</span>
            </div>
            <button [routerLink]="['/login']" type="button" mat-flat-button color="primary">Iniciar sesión</button>
          }
        </div>

        <div class="col-12 col-sm-4">
          <div class="text-center">
            <img loading="lazy" decoding="async" src="/assets/images/login-bg.gif" alt="" width="300" height="247">
            <div class="dot--ccc mt-0">
              <span class="w200">¿No tienes cuenta?</span>
            </div>
            <button [routerLink]="['/registro']" type="button" mat-flat-button color="primary">Registrate</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RestablecerPasswordComponent {
  private readonly securityService = inject(IHttpSecurityService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

  readonly password = new FormControl('', { nonNullable: true });
  readonly repetir = new FormControl('', { nonNullable: true });
  readonly guardando = signal(false);
  readonly listo = signal(false);
  readonly error = signal(this.token ? '' : 'El enlace está incompleto. Ábrelo de nuevo desde el correo.');

  constructor() {
    inject(DisplayComponentService).setDisplay({ mainMenu: false, footer: true, searchFooter: false, submenu: false, background: '' });
    inject(SEOService).setSEO({ title: 'Restablecer contraseña', description: '', type: 'website', imageURL: '', tags: [], noIndex: true });
  }

  guardar(): void {
    const password = this.password.value;
    if (password.length < 6 || password.length > 100) {
      this.error.set('La contraseña debe tener entre 6 y 100 caracteres.');
      return;
    }
    if (password !== this.repetir.value) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    this.securityService
      .restablecerPassword(this.token, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.listo.set(true);
          // Las sesiones se cerraron en el servidor: la de este navegador tampoco sirve ya.
          // Se limpia sin logout(), que navegaría al inicio y taparía este mensaje.
          if (this.securityService.getCurrentUser()?.token) this.securityService.setUserToLocalStorage({ token: '' });
        },
        error: (e: unknown) => {
          this.guardando.set(false);
          this.error.set(e instanceof Error ? e.message : 'No se pudo cambiar la contraseña.');
        },
      });
  }
}

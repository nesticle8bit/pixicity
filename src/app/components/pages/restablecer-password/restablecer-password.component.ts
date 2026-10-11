import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';

/** Destino del enlace del correo: /restablecer-password?token=... */
@Component({
  selector: 'app-restablecer-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // FormsModule: convierte el <form> en ngForm (ngSubmit sin recargar la página).
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  styleUrl: './cuenta-tarjeta.scss',
  template: `
    <div class="container container--home">
      @if (!listo()) {
        <form class="tarjeta" (ngSubmit)="guardar()">
          <h1 class="tarjeta__titulo">Elige una contraseña nueva</h1>
          <label class="tarjeta__campo">
            Contraseña nueva
            <input type="password" [formControl]="password" autocomplete="new-password" minlength="6" maxlength="100" required />
          </label>
          <label class="tarjeta__campo">
            Repite la contraseña
            <input type="password" [formControl]="repetir" autocomplete="new-password" required />
          </label>
          @if (error()) {
            <p class="tarjeta__error" role="alert">{{ error() }}</p>
          }
          <button type="submit" class="tarjeta__boton" [disabled]="guardando()">
            {{ guardando() ? 'Guardando…' : 'Cambiar contraseña' }}
          </button>
          <a routerLink="/olvide-password" class="tarjeta__enlace">Pedir un enlace nuevo</a>
        </form>
      } @else {
        <section class="tarjeta" aria-live="polite">
          <i class="ti ti-circle-check tarjeta__icono" aria-hidden="true"></i>
          <h1 class="tarjeta__titulo">¡Contraseña cambiada!</h1>
          <p class="tarjeta__texto">Ya puedes iniciar sesión con tu contraseña nueva. Cerramos las sesiones abiertas en otros dispositivos.</p>
          <a routerLink="/login" class="tarjeta__boton">Iniciar sesión</a>
        </section>
      }
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
    inject(DisplayComponentService).setDisplay({ mainMenu: true, footer: true, searchFooter: false, submenu: false, background: '' });
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

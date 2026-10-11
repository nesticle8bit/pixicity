import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { CargandoComponent } from '../../shared/cargando/cargando.component';

type Estado = 'confirmando' | 'ok' | 'error';

/** Destino del enlace del correo: /confirmar-email?token=... */
@Component({
  selector: 'app-confirmar-email',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CargandoComponent],
  template: `
    <div class="container container--home">
      <section class="confirmar" aria-live="polite">
        @switch (estado()) {
          @case ('confirmando') {
            <app-cargando tamano="lg" texto="Confirmando tu correo…" />
          }
          @case ('ok') {
            <i class="ti ti-circle-check confirmar__icono confirmar__icono--ok" aria-hidden="true"></i>
            <h1 class="confirmar__titulo">¡Correo confirmado!</h1>
            <p class="confirmar__texto">Listo{{ userName() ? ', ' + userName() : '' }}. Ya puedes publicar posts, shouts y comentarios.</p>
            <a [routerLink]="haySesion ? '/mi' : '/login'" class="confirmar__boton">
              {{ haySesion ? 'Ir a mi muro' : 'Iniciar sesión' }}
            </a>
          }
          @case ('error') {
            <i class="ti ti-mail-off confirmar__icono confirmar__icono--error" aria-hidden="true"></i>
            <h1 class="confirmar__titulo">No pudimos confirmar tu correo</h1>
            <p class="confirmar__texto">{{ error() }}</p>
            <a [routerLink]="haySesion ? '/' : '/login'" class="confirmar__boton">
              {{ haySesion ? 'Volver al inicio' : 'Iniciar sesión' }}
            </a>
            @if (haySesion) {
              <p class="confirmar__ayuda">Puedes pedir un enlace nuevo desde el aviso de arriba.</p>
            }
          }
        }
      </section>
    </div>
  `,
  styles: `
    .confirmar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      max-width: 480px;
      margin: 48px auto;
      padding: 32px 24px;
      border: 1px solid #e3e9ed;
      border-radius: 14px;
      background: #fff;
      text-align: center;
    }
    .confirmar__icono { font-size: 3rem; }
    .confirmar__icono--ok { color: #1e7f4f; }
    .confirmar__icono--error { color: #b3261e; }
    .confirmar__titulo { margin: 0; font-size: 1.35rem; font-weight: 800; color: #26323a; }
    .confirmar__texto { margin: 0; color: #5d6b75; }
    .confirmar__ayuda { margin: 4px 0 0; font-size: 0.82rem; color: #5d6b75; }
    .confirmar__boton {
      margin-top: 10px;
      padding: 9px 20px;
      border-radius: 8px;
      background: #006595;
      font-weight: 700;
      color: #fff;
      text-decoration: none;
      &:hover { background: #00527a; color: #fff; }
      &:focus-visible { outline: 2px solid #006595; outline-offset: 2px; }
    }
  `,
})
export class ConfirmarEmailComponent {
  private readonly securityService = inject(IHttpSecurityService);

  readonly estado = signal<Estado>('confirmando');
  readonly userName = signal('');
  readonly error = signal('');
  readonly haySesion = !!this.securityService.getCurrentUser()?.usuario;

  constructor() {
    inject(DisplayComponentService).setDisplay({ mainMenu: true, footer: true, searchFooter: false, submenu: false, background: '' });
    inject(SEOService).setSEO({ title: 'Confirmar correo', description: '', type: 'website', imageURL: '', tags: [], noIndex: true });

    const token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.fallar('El enlace está incompleto. Ábrelo de nuevo desde el correo.');
      return;
    }

    this.securityService
      .confirmarEmail(token)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: ({ userName }) => {
          this.userName.set(userName);
          this.estado.set('ok');
          // Si confirmó la cuenta de la sesión abierta, se va el aviso sin recargar.
          if (this.securityService.getCurrentUser()?.usuario?.userName?.toLowerCase() === userName?.toLowerCase()) {
            this.securityService.marcarEmailConfirmado(true);
          }
        },
        error: (e: unknown) => this.fallar(e instanceof Error ? e.message : 'El enlace no es válido o ya venció.'),
      });
  }

  private fallar(mensaje: string): void {
    this.error.set(mensaje);
    this.estado.set('error');
  }
}

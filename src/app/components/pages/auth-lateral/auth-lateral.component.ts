import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { EstadisticasViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';

/**
 * Lateral de /login y /registro: invita a la otra acción (entrar / crear cuenta), cuenta qué se puede hacer con
 * una cuenta, muestra la comunidad en números y deja a mano la ayuda.
 */
@Component({
  selector: 'app-auth-lateral',
  templateUrl: './auth-lateral.component.html',
  styleUrl: './auth-lateral.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe],
})
export class AuthLateralComponent {
  /** En qué página está: el lateral ofrece la otra. */
  readonly modo = input.required<'login' | 'registro'>();

  readonly stats = signal<EstadisticasViewModel | null>(null);

  readonly beneficios = [
    { icono: 'ti-pencil', titulo: 'Publica', texto: 'Posts, shouts, fotos y temas en comunidades.' },
    { icono: 'ti-message-circle', titulo: 'Participa', texto: 'Comenta, vota y da me gusta a lo mejor del sitio.' },
    { icono: 'ti-users', titulo: 'Conecta', texto: 'Sigue a otros usuarios y súmate a comunidades.' },
    { icono: 'ti-hash', titulo: 'Descubre', texto: 'Tendencias y #hashtags en tu muro personal.' },
  ];

  constructor() {
    inject(IHttpGeneralService)
      .getEstadisticas()
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(),
      )
      .subscribe((s) => this.stats.set(s));
  }
}

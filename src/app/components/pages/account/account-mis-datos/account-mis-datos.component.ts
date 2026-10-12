import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';

/** /cuenta → Mis datos: descarga en JSON todo lo que el sitio guarda del usuario. */
@Component({
  selector: 'app-account-mis-datos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-mis-datos.component.html',
  styleUrl: './account-mis-datos.component.scss',
})
export class AccountMisDatosComponent {
  private readonly perfilService = inject(IHttpUsuarioPerfilService);
  private readonly destroyRef = inject(DestroyRef);

  readonly descargando = signal(false);
  readonly error = signal('');

  descargar(): void {
    if (this.descargando()) return;
    this.descargando.set(true);
    this.error.set('');

    this.perfilService
      .exportarMisDatos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (archivo) => {
          this.descargando.set(false);
          const url = URL.createObjectURL(archivo);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
          enlace.click();
          URL.revokeObjectURL(url);
        },
        error: (e: { status?: number }) => {
          this.descargando.set(false);
          this.error.set(e?.status === 429 ? 'Ya pediste tus datos varias veces. Prueba de nuevo en una hora.' : 'No se pudieron descargar tus datos.');
        },
      });
  }
}

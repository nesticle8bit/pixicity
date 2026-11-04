import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MedallaUsuario, periodoMedalla, srcMedalla } from 'src/app/models/seguridad/medalla.model';
import { IHttpMedallasService } from 'src/app/services/interfaces/httpMedallas.interface';

/**
 * Pestaña "Medallas" del perfil, como la lista de Taringa!: cada vez que la ganó, con el período
 * ("Septiembre de 2008"), el post o la comunidad con la que la ganó y el texto de la medalla.
 */
@Component({
  selector: 'app-profile-medallas',
  templateUrl: './profile-medallas.component.html',
  styleUrl: './profile-medallas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class ProfileMedallasComponent {
  private readonly medallasService = inject(IHttpMedallasService);
  private readonly destroyRef = inject(DestroyRef);

  readonly userName = input.required<string>();

  readonly medallas = signal<MedallaUsuario[]>([]);
  readonly cargado = signal(false);
  readonly src = srcMedalla;
  readonly periodo = periodoMedalla;

  constructor() {
    // Solo depende de userName: la petición va en untracked (ver feedback del loader global).
    effect(() => {
      const userName = this.userName();
      untracked(() => {
        this.cargado.set(false);
        if (!userName) return;
        this.medallasService.getMedallasUsuario(userName)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (m) => { this.medallas.set(m ?? []); this.cargado.set(true); },
            error: () => { this.medallas.set([]); this.cargado.set(true); },
          });
      });
    });
  }
}

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { MedallaUsuario, srcMedalla } from 'src/app/models/seguridad/medalla.model';
import { IHttpMedallasService } from 'src/app/services/interfaces/httpMedallas.interface';

/** Cuántas se ven antes de "Ver todas". */
const VISIBLES = 15;

/** Medallas del usuario en el lateral del perfil (como en el Taringa! clásico); oculta si no tiene ninguna. */
@Component({
  selector: 'app-perfil-medallas',
  templateUrl: './perfil-medallas.component.html',
  styleUrl: './perfil-medallas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTooltip, DatePipe],
})
export class PerfilMedallasComponent {
  private readonly medallasService = inject(IHttpMedallasService);
  private readonly destroyRef = inject(DestroyRef);

  readonly userName = input.required<string>();

  readonly medallas = signal<MedallaUsuario[]>([]);
  readonly todas = signal(false);
  readonly src = srcMedalla;
  readonly visibles = VISIBLES;

  constructor() {
    // El effect solo depende de userName; la petición va en untracked para que nada de lo que lea por dentro
    // (interceptores, loader global) lo vuelva a disparar.
    effect(() => {
      const userName = this.userName();
      untracked(() => {
        this.medallas.set([]);
        this.todas.set(false);
        if (!userName) return;
        this.medallasService.getMedallasUsuario(userName)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: (m) => this.medallas.set(m ?? []), error: () => this.medallas.set([]) });
      });
    });
  }

  /** Tooltip: título, y el motivo o la descripción. */
  detalle(m: MedallaUsuario): string {
    const extra = m.motivo || m.descripcion;
    return extra ? `${m.titulo} — ${extra}` : m.titulo;
  }
}

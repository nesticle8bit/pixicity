import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { MedallaUsuario, periodoMedalla, srcMedalla } from 'src/app/models/seguridad/medalla.model';
import { IHttpMedallasService } from 'src/app/services/interfaces/httpMedallas.interface';

/** Cuántas se ven antes de "Ver todas". */
const VISIBLES = 15;

/** Medallas del usuario en el lateral del perfil (como en el Taringa! clásico); oculta si no tiene ninguna. */
@Component({
  selector: 'app-perfil-medallas',
  templateUrl: './perfil-medallas.component.html',
  styleUrl: './perfil-medallas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTooltip],
})
export class PerfilMedallasComponent {
  private readonly medallasService = inject(IHttpMedallasService);
  private readonly destroyRef = inject(DestroyRef);

  readonly userName = input.required<string>();
  /** "Ver todas": abre la pestaña Medallas del perfil con el detalle de cada una. */
  readonly verTodas = output<void>();

  readonly medallas = signal<MedallaUsuario[]>([]);
  readonly src = srcMedalla;
  readonly visibles = VISIBLES;

  /** Una por medalla, con cuántas veces la ganó (los rankings se ganan una vez por período). */
  readonly grupos = computed(() => {
    const porMedalla = new Map<number, { m: MedallaUsuario; veces: number }>();
    for (const m of this.medallas()) {
      const g = porMedalla.get(m.medallaId);
      if (g) g.veces++;
      else porMedalla.set(m.medallaId, { m, veces: 1 });
    }
    return [...porMedalla.values()];
  });

  constructor() {
    // El effect solo depende de userName; la petición va en untracked para que nada de lo que lea por dentro
    // (interceptores, loader global) lo vuelva a disparar.
    effect(() => {
      const userName = this.userName();
      untracked(() => {
        this.medallas.set([]);
        if (!userName) return;
        this.medallasService.getMedallasUsuario(userName)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: (m) => this.medallas.set(m ?? []), error: () => this.medallas.set([]) });
      });
    });
  }

  /** Tooltip: título (×N si la ganó varias veces), el texto y cuándo (la última vez). */
  detalle(m: MedallaUsuario, veces: number): string {
    const extra = m.motivo || m.descripcion;
    return `${m.titulo}${veces > 1 ? ` (×${veces})` : ''}${extra ? ` — ${extra}` : ''} · ${periodoMedalla(m)}`;
  }
}

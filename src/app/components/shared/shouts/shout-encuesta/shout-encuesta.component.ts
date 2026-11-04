import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ShoutEncuesta } from 'src/app/models/perfil/shout-vm.model';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SesionRequeridaService } from 'src/app/services/shared/sesion-requerida.service';

/** "Quedan 3 h" / "Quedan 2 días" / "Quedan 12 min" hasta el cierre. */
export function tiempoRestante(cierre: string, ahora = Date.now()): string {
  const min = Math.max(0, Math.ceil((new Date(cierre).getTime() - ahora) / 60000));
  if (min >= 24 * 60) {
    const dias = Math.floor(min / (24 * 60));
    return `Quedan ${dias} ${dias === 1 ? 'día' : 'días'}`;
  }
  if (min >= 60) return `Quedan ${Math.floor(min / 60)} h`;
  return `Quedan ${min} min`;
}

/**
 * Encuesta de un shout, como en Twitter: mientras está abierta y no votaste se ven las opciones como botones; al
 * votar (o si es tuya, o ya cerró) se ven los porcentajes, con la ganadora y tu voto marcados. No se cambia el voto.
 */
@Component({
  selector: 'app-shout-encuesta',
  templateUrl: './shout-encuesta.component.html',
  styleUrl: './shout-encuesta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
})
export class ShoutEncuestaComponent {
  private readonly perfilService = inject(IHttpPerfilService);
  private readonly notificationService = inject(NotificationService);
  private readonly sesion = inject(SesionRequeridaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly shoutId = input.required<number>();
  readonly encuestaInicial = input.required<ShoutEncuesta>({ alias: 'encuesta' });
  /** El autor no vota: ve los resultados desde el principio. */
  readonly esAutor = input(false);

  readonly encuesta = signal<ShoutEncuesta | null>(null);
  readonly votando = signal(false);

  constructor() {
    effect(() => this.encuesta.set(this.encuestaInicial()));
  }

  /** Cerró por fecha aunque la lista se haya cargado antes del cierre. */
  readonly cerrada = computed(() => {
    const e = this.encuesta();
    return !!e && (e.cerrada || new Date(e.cierre).getTime() <= Date.now());
  });
  readonly verResultados = computed(() => this.cerrada() || this.esAutor() || this.encuesta()?.miVoto != null);
  readonly maxVotos = computed(() => Math.max(0, ...(this.encuesta()?.opciones.map((o) => o.votos) ?? [])));
  readonly estado = computed(() => {
    const e = this.encuesta();
    if (!e) return '';
    const votos = `${e.totalVotos} ${e.totalVotos === 1 ? 'voto' : 'votos'}`;
    return `${votos} · ${this.cerrada() ? 'Resultados finales' : tiempoRestante(e.cierre)}`;
  });

  porcentaje(votos: number): number {
    const total = this.encuesta()?.totalVotos ?? 0;
    return total ? (votos * 100) / total : 0;
  }

  votar(opcionId: number): void {
    if (this.votando() || this.verResultados()) return;
    if (!this.sesion.exigir('Inicia sesión para votar en la encuesta')) return;
    this.votando.set(true);
    this.perfilService.votarEncuesta(this.shoutId(), opcionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (e) => {
          this.encuesta.set(e);
          this.votando.set(false);
        },
        error: (e: unknown) => {
          this.votando.set(false);
          this.notificationService.error(e instanceof Error ? e.message : 'No se pudo votar', 'Encuesta');
        },
      });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { NsfwService } from 'src/app/services/shared/nsfw.service';
import { Muro, PeriodoActivos } from 'src/app/models/mi/mi-vm.model';
import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { enNavegador } from '../../../shared/helpers/plataforma';
import { enlaceShout, imagenShout } from '../../../shared/helpers/shout-imagen';

/**
 * 'activos': los de más actividad (me gusta, comentarios, reshouts) publicados en el `periodo`, igual que
 * /mi → Más activos. 'recientes': los últimos publicados, sin importar la actividad (ahí `periodo` no se usa).
 */
export type ModoShoutsPortada = 'activos' | 'recientes';

const TITULOS: Record<PeriodoActivos, string> = {
  dia: 'Shouts del día',
  semana: 'Shouts de la semana',
  mes: 'Shouts del mes',
};

const VACIOS: Record<PeriodoActivos, string> = {
  dia: 'Hoy todavía no hay shouts con actividad',
  semana: 'Esta semana todavía no hay shouts con actividad',
  mes: 'Este mes todavía no hay shouts con actividad',
};

// Lo mismo que dura la barra de progreso del carrusel (animation: progress 4s).
const INTERVALO_MS = 4000;

/**
 * Carrusel de shouts para la portada (mismo diseño que Top Shouts). Se configura desde el template, p. ej.:
 *   <app-home-shouts-activos />                          → los más activos del día (por defecto)
 *   <app-home-shouts-activos periodo="semana" />         → los más activos de la semana
 *   <app-home-shouts-activos periodo="mes" [cantidad]="10" />
 *   <app-home-shouts-activos modo="recientes" />         → los últimos publicados
 */
@Component({
  selector: 'app-home-shouts-activos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-shouts-activos.component.html',
  // Mismo carrusel que Top Fotos y Top Shouts.
  styleUrls: [
    '../home-last-photos/home-last-photos.component.scss',
    '../home-top-shouts/home-top-shouts.component.scss',
  ],
  imports: [RouterLink, MatTooltip, TimeAgoPipe],
})
export class HomeShoutsActivosComponent {
  private readonly miService = inject(IHttpMiService);
  private readonly preferenciaNsfw = inject(NsfwService);

  readonly modo = input<ModoShoutsPortada>('activos');
  readonly periodo = input<PeriodoActivos>('dia');
  readonly cantidad = input(5);
  /** Si no se indica, sale del modo y el período ("Shouts del día", "Shouts recientes"…). */
  readonly titulo = input<string | null>(null);

  readonly tituloVisible = computed(
    () =>
      this.titulo() ??
      (this.modo() === 'recientes'
        ? 'Shouts recientes'
        : TITULOS[this.periodo()]),
  );
  readonly mensajeVacio = computed(() =>
    this.modo() === 'recientes'
      ? 'Todavía no hay shouts'
      : VACIOS[this.periodo()],
  );

  private readonly pedido = computed(() => ({
    modo: this.modo(),
    periodo: this.periodo(),
    cantidad: this.cantidad(),
  }));

  /** undefined = cargando. */
  readonly shouts = toSignal(
    toObservable(this.pedido).pipe(
      switchMap(({ modo, periodo, cantidad }) => {
        const muro =
          modo === 'recientes'
            ? this.miService.getMuro('todos', null, cantidad)
            : this.miService.getActivos(periodo, 1, cantidad, true);
        return muro.pipe(
          map((m) => this.soloShouts(m, cantidad)),
          catchError(() => of([] as ShoutViewModel[])),
          startWith(undefined),
        );
      }),
    ),
  );

  readonly actual = signal(0);
  readonly pausado = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly imagen = imagenShout;
  readonly enlace = enlaceShout;

  constructor() {
    // Lista nueva (primera carga o cambió un parámetro): vuelve al primero y arranca a rotar.
    effect(() => {
      this.shouts();
      untracked(() => {
        this.actual.set(0);
        this.iniciar();
      });
    });
    inject(DestroyRef).onDestroy(() => this.detener());
  }

  difuminar(s: ShoutViewModel): boolean {
    return !!s.nsfw && !this.preferenciaNsfw.mostrar();
  }

  /** Solo la visible y la siguiente piden su imagen. */
  cargarImagen(i: number): boolean {
    const total = this.shouts()?.length ?? 0;
    return i === this.actual() || i === (this.actual() + 1) % total;
  }

  alternarPausa(): void {
    this.pausado.update((p) => !p);
    if (this.pausado()) this.detener();
    else this.iniciar();
  }

  iniciar(): void {
    this.detener();
    if (this.pausado() || (this.shouts()?.length ?? 0) < 2 || !enNavegador()) return;
    this.timer = setInterval(() => this.siguiente(), INTERVALO_MS);
  }

  detener(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  siguiente(): void {
    const total = this.shouts()?.length ?? 0;
    if (total) this.actual.update((i) => (i + 1) % total);
  }

  anterior(): void {
    const total = this.shouts()?.length ?? 0;
    if (total) this.actual.update((i) => (i - 1 + total) % total);
  }

  irA(i: number): void {
    this.actual.set(i);
    this.iniciar();
  }

  /** El muro mezcla posts y reshouts: quedan los shouts, cada uno una vez. */
  private soloShouts(muro: Muro, cantidad: number): ShoutViewModel[] {
    const vistos = new Set<number>();
    return muro.items
      .map((i) => i.shout)
      .filter(
        (s): s is ShoutViewModel =>
          !!s && !vistos.has(s.id) && !!vistos.add(s.id),
      )
      .slice(0, cantidad);
  }
}

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PerfilRef } from 'src/app/models/seguridad/seguridad-vm.model';
import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { ActividadMuro, FiltroMuroPerfil, MuroPerfilItem } from 'src/app/models/perfil/perfil-muro.model';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { TiempoCortoPipe } from 'src/app/shared/pipes/tiempo-corto.pipe';
import { ShoutCardComponent } from '../../shared/shouts/shout-card/shout-card.component';
import { PostCardComponent } from '../../shared/shouts/post-card/post-card.component';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { armarBloques, iconoActividad } from './linea-de-tiempo';

const POR_PAGINA = 15;

const FILTROS: { id: FiltroMuroPerfil; label: string; icono: string; vacio: string }[] = [
  { id: 'todo', label: 'Todo', icono: 'ti-timeline', vacio: 'Todavía no hay nada por aquí.' },
  { id: 'shouts', label: 'Shouts', icono: 'ti-message-circle-2', vacio: 'Todavía no hay shouts.' },
  { id: 'posts', label: 'Posts', icono: 'ti-file-text', vacio: 'Todavía no publicó posts.' },
  { id: 'comentarios', label: 'Comentarios', icono: 'ti-message-circle', vacio: 'Todavía no comentó.' },
  { id: 'reacciones', label: 'Reacciones', icono: 'ti-heart', vacio: 'Todavía no hay reacciones.' },
  { id: 'comunidades', label: 'Comunidades', icono: 'ti-users-group', vacio: 'Todavía no participa en comunidades.' },
];

/**
 * Línea de tiempo del perfil: shouts, compartidos, posts, comentarios y el resto de la actividad, mezclados por fecha.
 * Carga de a 15 al acercarse al final (scroll infinito, con "Cargar más" de respaldo), agrupa por día y pliega las
 * tandas largas de reacciones.
 */
@Component({
  selector: 'app-profile-timeline',
  templateUrl: './profile-timeline.component.html',
  styleUrls: ['./profile-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ShoutCardComponent, PostCardComponent, UserAvatarComponent, TiempoCortoPipe],
})
export class ProfileTimelineComponent {
  private readonly usuarioPerfil = inject(IHttpUsuarioPerfilService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = input<PerfilRef | null>(null);

  readonly filtros = FILTROS;
  readonly filtro = signal<FiltroMuroPerfil>('todo');
  readonly items = signal<MuroPerfilItem[]>([]);
  readonly fijado = signal<ShoutViewModel | null>(null);
  readonly siguiente = signal<string | null>(null);
  readonly cargando = signal(true);
  readonly cargandoMas = signal(false);
  readonly error = signal(false);
  private readonly abiertas = signal<ReadonlySet<string>>(new Set());

  readonly bloques = computed(() => armarBloques(this.items(), this.abiertas()));
  readonly vacio = computed(() => FILTROS.find((f) => f.id === this.filtro())!.vacio);
  private readonly usuarioId = computed(() => this.user()?.id ?? 0);

  private readonly finDeLista = viewChild<ElementRef<HTMLElement>>('finDeLista');
  private observador?: IntersectionObserver;
  private carga?: Subscription;

  constructor() {
    // Otro perfil u otro filtro: desde arriba.
    effect(() => {
      const id = this.usuarioId();
      this.filtro();
      if (id) untracked(() => this.cargar(true));
    });

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      this.observador = new IntersectionObserver((entradas) => {
        if (entradas.some((e) => e.isIntersecting)) this.cargarMas();
      }, { rootMargin: '600px 0px' });
      this.observar();
    });
    this.destroyRef.onDestroy(() => {
      this.observador?.disconnect();
      this.carga?.unsubscribe();
    });
  }

  /** Después de publicar o de fijar/desfijar un shout. */
  recargar(): void {
    this.cargar(true);
  }

  elegirFiltro(filtro: FiltroMuroPerfil, e?: Event): void {
    if (filtro === this.filtro()) return;
    this.filtro.set(filtro);
    // Elegido desde abajo (los chips quedaron arriba de la pantalla): vuelve al principio de la lista nueva.
    const filtros = (e?.currentTarget as HTMLElement | undefined)?.parentElement;
    if (filtros && filtros.getBoundingClientRect().top < 0) filtros.scrollIntoView({ block: 'start' });
  }

  cargarMas(): void {
    if (this.cargando() || this.cargandoMas() || !this.siguiente() || this.error()) return;
    this.cargar(false);
  }

  reintentar(): void {
    this.cargar(this.items().length === 0);
  }

  abrirTanda(clave: string): void {
    this.abiertas.update((a) => new Set(a).add(clave));
  }

  icono(a: ActividadMuro) {
    return iconoActividad(a);
  }

  private cargar(reiniciar: boolean): void {
    const id = this.usuarioId();
    if (!id) return;

    this.carga?.unsubscribe();
    this.error.set(false);
    if (reiniciar) {
      this.cargando.set(true);
      this.abiertas.set(new Set());
    } else {
      this.cargandoMas.set(true);
    }

    this.carga = this.usuarioPerfil
      .getMuroPerfil(id, reiniciar ? null : this.siguiente(), this.filtro(), POR_PAGINA)
      .subscribe({
        next: (muro) => {
          if (reiniciar) {
            this.items.set(muro.items);
            this.fijado.set(muro.fijado ?? null);
          } else {
            // Por las dudas (misma fecha en el borde de dos páginas): sin repetidos.
            const claves = new Set(this.items().map((i) => i.clave));
            this.items.update((actuales) => [...actuales, ...muro.items.filter((i) => !claves.has(i.clave))]);
          }
          this.siguiente.set(muro.siguiente);
          this.cargando.set(false);
          this.cargandoMas.set(false);
          this.observar();
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
          this.cargandoMas.set(false);
        },
      });
  }

  /**
   * El observador avisa solo cuando el final entra o sale de la vista. Si después de una carga sigue visible (lista
   * corta o pantalla alta), no habría otro aviso: se vuelve a observar para que dispare de nuevo.
   */
  private observar(): void {
    const fin = this.finDeLista()?.nativeElement;
    if (!this.observador || !fin) return;
    this.observador.unobserve(fin);
    queueMicrotask(() => this.observador?.observe(fin));
  }
}

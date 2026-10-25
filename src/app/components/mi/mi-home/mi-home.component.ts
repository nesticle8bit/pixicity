import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { TimeAgoPipe } from 'src/app/shared/pipes/timeAgo.pipe';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, combineLatest, EMPTY, Subject, switchMap, tap } from 'rxjs';
import { AlcanceMuro, OrdenTendencias, MiResumen, MuroItem, SugerenciaUsuario, Tendencia } from 'src/app/models/mi/mi-vm.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { SesionRequeridaService } from 'src/app/services/shared/sesion-requerida.service';
import { environment } from 'src/environments/environment';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { CargandoComponent } from '../../shared/cargando/cargando.component';
import { AnuncioComponent } from '../../ads/anuncio/anuncio.component';
import { PostOriginalPosterInfoComponent } from '../../posts/post-original-poster-info/post-original-poster-info.component';
import { PostCardComponent } from '../../shared/shouts/post-card/post-card.component';
import { ShoutCardComponent } from '../../shared/shouts/shout-card/shout-card.component';
import { ShoutComposerComponent } from '../../shared/shouts/shout-composer/shout-composer.component';

const POR_PAGINA = 15;

/**
 * /mi: el inicio personal. Muro con los shouts propios y de quienes sigues (más lo que comparten y sus posts nuevos)
 * o "Novedades" con los shouts de todo el sitio; al costado, el resumen del usuario y a quién seguir.
 * Es pública: sin sesión se ven Novedades y los #hashtags (indexables); interactuar lleva al login.
 */
@Component({
  selector: 'app-mi-home',
  templateUrl: './mi-home.component.html',
  styleUrls: ['./mi-home.component.scss'],
  imports: [
    RouterLink,
    MatTooltip,
    DecimalPipe,
    TimeAgoPipe,
    NgTemplateOutlet,
    UserAvatarComponent,
    CargandoComponent,
    AnuncioComponent,
    PostOriginalPosterInfoComponent,
    PostCardComponent,
    ShoutCardComponent,
    ShoutComposerComponent,
  ],
})
export class MiHomeComponent implements OnDestroy {
  private readonly miService = inject(IHttpMiService);
  private readonly usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly seo = inject(SEOService);
  private readonly sesion = inject(SesionRequeridaService);
  readonly haySesion = this.sesion.haySesion;

  readonly alcance = signal<AlcanceMuro>('siguiendo');
  readonly items = signal<MuroItem[]>([]);
  readonly siguiente = signal<string | null>(null);
  /** Primera carga de la pestaña (muestra el indicador grande). */
  readonly cargando = signal(true);
  /** "Cargar más" en curso. */
  readonly cargandoMas = signal(false);
  readonly error = signal(false);

  /** #hashtag elegido (/hashtag/:tag, o ?tag= de enlaces viejos): muestra los shouts del sitio con ese tag en vez de las pestañas. */
  readonly tag = signal<string | null>(null);
  /** Hashtags del lateral: "Mejores" (más usados) y "Recientes" (últimos usados). */
  readonly tendencias = signal<Tendencia[]>([]);
  readonly recientes = signal<Tendencia[]>([]);
  readonly ordenTags = signal<OrdenTendencias>('mejores');
  readonly ordenes: OrdenTendencias[] = ['mejores', 'recientes'];
  /** Shouts nuevos de gente que sigo, llegados en vivo desde que cargó el muro. */
  readonly nuevos = signal(0);

  readonly resumen = signal<MiResumen | null>(null);
  readonly sugerencias = signal<(SugerenciaUsuario & { siguiendo?: boolean; procesando?: boolean })[]>([]);

  private readonly pedir = new Subject<{ reiniciar: boolean }>();
  private readonly finDeLista = viewChild<ElementRef<HTMLElement>>('finDeLista');
  private observador?: IntersectionObserver;

  constructor() {
    inject(DisplayComponentService).setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: true,
      background: '',
    });

    // switchMap: cambiar de pestaña descarta la página que estaba en camino.
    this.pedir
      .pipe(
        tap(({ reiniciar }) => {
          this.error.set(false);
          if (reiniciar) {
            this.nuevos.set(0);
            this.cargando.set(true);
            this.items.set([]);
            this.siguiente.set(null);
          } else {
            this.cargandoMas.set(true);
          }
        }),
        switchMap(({ reiniciar }) =>
          this.miService.getMuro(this.alcance(), reiniciar ? null : this.siguiente(), POR_PAGINA, this.tag()).pipe(
            catchError(() => {
              this.error.set(true);
              this.cargando.set(false);
              this.cargandoMas.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((muro) => {
        this.items.update((l) => [...l, ...muro.items]);
        this.siguiente.set(muro.siguiente);
        this.cargando.set(false);
        this.cargandoMas.set(false);
        this.reobservarFin();
      });

    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(takeUntilDestroyed()).subscribe(([p, q]) => {
      // Sin sesión no hay muro propio: siempre Novedades.
      this.alcance.set(!this.haySesion || q.get('ver') === 'novedades' ? 'todos' : 'siguiendo');
      this.tag.set((p.get('tag') ?? q.get('tag'))?.replace(/^#/, '').toLowerCase() || null);
      this.aplicarSEO();
      this.pedir.next({ reiniciar: true });
    });

    if (this.haySesion) this.miService.getResumen().pipe(takeUntilDestroyed()).subscribe((r) => this.resumen.set(r));
    this.miService.getSugerencias(5).pipe(takeUntilDestroyed()).subscribe((s) => this.sugerencias.set(s));
    this.miService.getTendencias(8, 'mejores').pipe(takeUntilDestroyed()).subscribe((t) => this.tendencias.set(t));
    this.miService.getTendencias(8, 'recientes').pipe(takeUntilDestroyed()).subscribe((t) => this.recientes.set(t));

    // Shout nuevo de alguien que sigo: no se mete en la lista (movería lo que estoy leyendo), se ofrece "ver nuevos".
    const signalr = inject(SignalrService);
    const token = inject(IHttpSecurityService).getCurrentUser()?.token;
    if (token) void signalr.start(token);
    signalr.shoutNuevo$.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.alcance() === 'siguiendo' && !this.tag()) this.nuevos.update((n) => n + 1);
    });

    // Al acercarse al final de la lista carga la página siguiente (el botón "Cargar más" queda como respaldo).
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      this.observador = new IntersectionObserver(
        (entradas) => {
          if (entradas.some((e) => e.isIntersecting)) this.cargarMas();
        },
        { rootMargin: '400px 0px' },
      );
      const fin = this.finDeLista()?.nativeElement;
      if (fin) this.observador.observe(fin);
    });
  }

  /**
   * El observador avisa solo cuando el final de la lista entra o sale de la vista. Si después de una carga sigue
   * visible (lista corta o pantalla alta), no habría otro aviso: se vuelve a observar para que dispare de nuevo.
   */
  private reobservarFin(): void {
    setTimeout(() => {
      const fin = this.finDeLista()?.nativeElement;
      if (!this.observador || !fin) return;
      this.observador.unobserve(fin);
      this.observador.observe(fin);
    });
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
  }

  /** El muro "Siguiendo" es personal (noindex); Novedades y cada #hashtag son públicos e indexables. */
  private aplicarSEO(): void {
    const tag = this.tag();
    const personal = !tag && this.alcance() === 'siguiendo';
    const base = `${environment.publicUrl}/mi`;
    this.seo.setSEO({
      title: tag ? `#${tag} · Shouts` : personal ? 'Mi muro' : 'Shouts: lo último de la comunidad',
      description: tag
        ? `Shouts con #${tag}: lo que la comunidad está diciendo sobre ${tag}.`
        : personal
          ? 'Tu muro: lo que comparten las personas que sigues.'
          : 'Los shouts más recientes de la comunidad: textos, fotos, videos y enlaces. Tendencias y hashtags del momento.',
      type: 'website',
      imageURL: '',
      tags: tag ? [tag, 'shouts'] : ['shouts', 'comunidad', 'tendencias'],
      noIndex: personal,
      canonical: tag ? `${environment.publicUrl}/hashtag/${encodeURIComponent(tag)}` : `${base}?ver=novedades`,
    });
  }

  cambiarAlcance(alcance: AlcanceMuro): void {
    if (alcance === 'siguiendo' && !this.sesion.exigir('Inicia sesión para ver tu muro')) return;
    if (alcance === this.alcance() && !this.tag()) return;
    this.router.navigate(['/mi'], {
      queryParams: { ver: alcance === 'todos' ? 'novedades' : null },
      replaceUrl: !this.tag(),
    });
  }

  quitarTag(): void {
    this.router.navigate(['/mi'], { queryParams: { ver: this.haySesion ? null : 'novedades' } });
  }

  verNuevos(): void {
    this.pedir.next({ reiniciar: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Flechas izquierda/derecha entre pestañas (patrón ARIA de tabs). */
  teclaPestanas(e: KeyboardEvent): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const otra: AlcanceMuro = this.alcance() === 'siguiendo' ? 'todos' : 'siguiendo';
    this.cambiarAlcance(otra);
    queueMicrotask(() => document.getElementById(`mi-tab-${otra}`)?.focus());
  }

  iniciarSesion(): void {
    this.sesion.irALogin();
  }

  /** Flechas entre las pestañas Mejores / Recientes. */
  teclaTags(e: KeyboardEvent): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const lista = e.currentTarget as HTMLElement;
    this.ordenTags.update((o) => (o === 'mejores' ? 'recientes' : 'mejores'));
    const orden = this.ordenTags();
    queueMicrotask(() => lista.querySelector<HTMLElement>(`[data-orden="${orden}"]`)?.focus());
  }

  cargarMas(): void {
    if (this.cargando() || this.cargandoMas() || !this.siguiente() || this.error()) return;
    this.pedir.next({ reiniciar: false });
  }

  reintentar(): void {
    this.pedir.next({ reiniciar: this.items().length === 0 });
  }

  /** Recarga el muro desde arriba (después de publicar). */
  alPublicar(): void {
    if (this.alcance() !== 'siguiendo') {
      this.cambiarAlcance('siguiendo');
    } else {
      this.pedir.next({ reiniciar: true });
    }
  }

  seguir(usuario: SugerenciaUsuario & { siguiendo?: boolean; procesando?: boolean }): void {
    if (usuario.procesando || !this.sesion.exigir('Inicia sesión para seguir usuarios')) return;
    this.actualizarSugerencia(usuario.userName, { procesando: true });
    this.usuarioPerfilService
      .seguirUsuario({ userName: usuario.userName })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const siguiendo = !usuario.siguiendo;
          this.actualizarSugerencia(usuario.userName, { siguiendo, procesando: false });
          // Sus shouts y posts entran (o salen) del muro.
          if (this.alcance() === 'siguiendo') this.pedir.next({ reiniciar: true });
        },
        error: () => this.actualizarSugerencia(usuario.userName, { procesando: false }),
      });
  }

  private actualizarSugerencia(userName: string, cambios: { siguiendo?: boolean; procesando?: boolean }): void {
    this.sugerencias.update((l) => l.map((s) => (s.userName === userName ? { ...s, ...cambios } : s)));
  }

  claveItem(item: MuroItem): string {
    return `${item.tipo}-${item.post?.id ?? item.shout?.id}-${item.fecha}`;
  }
}

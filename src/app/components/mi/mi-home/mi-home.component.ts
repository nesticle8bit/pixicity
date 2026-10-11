import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, Subject, switchMap, tap } from 'rxjs';
import { AlcanceMuro, MiResumen, MuroItem, SugerenciaUsuario, Tendencia } from 'src/app/models/mi/mi-vm.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { CargandoComponent } from '../../shared/cargando/cargando.component';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';
import { PostOriginalPosterInfoComponent } from '../../posts/post-original-poster-info/post-original-poster-info.component';
import { PostCardComponent } from '../../shared/shouts/post-card/post-card.component';
import { ShoutCardComponent } from '../../shared/shouts/shout-card/shout-card.component';
import { ShoutComposerComponent } from '../../shared/shouts/shout-composer/shout-composer.component';

const POR_PAGINA = 15;

/**
 * /mi: el inicio personal. Muro con los shouts propios y de quienes sigues (más lo que comparten y sus posts nuevos)
 * o "Novedades" con los shouts de todo el sitio; al costado, el resumen del usuario y a quién seguir.
 */
@Component({
  selector: 'app-mi-home',
  templateUrl: './mi-home.component.html',
  styleUrls: ['./mi-home.component.scss'],
  imports: [
    RouterLink,
    MatTooltip,
    DecimalPipe,
    NgTemplateOutlet,
    UserAvatarComponent,
    CargandoComponent,
    AdsByTypeComponent,
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

  readonly alcance = signal<AlcanceMuro>('siguiendo');
  readonly items = signal<MuroItem[]>([]);
  readonly siguiente = signal<string | null>(null);
  /** Primera carga de la pestaña (muestra el indicador grande). */
  readonly cargando = signal(true);
  /** "Cargar más" en curso. */
  readonly cargandoMas = signal(false);
  readonly error = signal(false);

  /** #hashtag elegido (?tag=...): muestra los shouts del sitio con ese tag en vez de las pestañas. */
  readonly tag = signal<string | null>(null);
  readonly tendencias = signal<Tendencia[]>([]);
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
    inject(SEOService).setSEO({
      title: 'Mi',
      description: 'Tu muro: lo que comparten las personas que sigues.',
      type: 'website',
      imageURL: '',
      tags: [],
      noIndex: true,
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

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((q) => {
      this.alcance.set(q.get('ver') === 'novedades' ? 'todos' : 'siguiendo');
      this.tag.set(q.get('tag')?.replace(/^#/, '').toLowerCase() || null);
      this.pedir.next({ reiniciar: true });
    });

    this.miService.getResumen().pipe(takeUntilDestroyed()).subscribe((r) => this.resumen.set(r));
    this.miService.getSugerencias(5).pipe(takeUntilDestroyed()).subscribe((s) => this.sugerencias.set(s));
    this.miService.getTendencias(8).pipe(takeUntilDestroyed()).subscribe((t) => this.tendencias.set(t));

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

  cambiarAlcance(alcance: AlcanceMuro): void {
    if (alcance === this.alcance() && !this.tag()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ver: alcance === 'todos' ? 'novedades' : null, tag: null },
      replaceUrl: true,
    });
  }

  quitarTag(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { tag: null }, queryParamsHandling: 'merge' });
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
    if (usuario.procesando) return;
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

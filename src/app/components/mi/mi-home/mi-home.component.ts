import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { TimeAgoPipe } from 'src/app/shared/pipes/timeAgo.pipe';
import { afterNextRender, Component, DestroyRef, ElementRef, HostListener, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, NavigationStart, ParamMap, Router, RouterLink } from '@angular/router';
import { auditTime, catchError, combineLatest, debounceTime, EMPTY, filter, firstValueFrom, fromEvent, interval, merge, Subject, switchMap, tap } from 'rxjs';
import { ConfirmarService } from 'src/app/services/shared/confirmar.service';
import { EDAD_NSFW, edadDesde } from 'src/app/shared/helpers/edad';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AlcanceMuro, OrdenTendencias, MiResumen, MuroItem, PeriodoActivos, SugerenciaUsuario, Tendencia } from 'src/app/models/mi/mi-vm.model';
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
import { TirarParaRecargarService } from 'src/app/services/shared/tirar-para-recargar.service';
import { NsfwService } from 'src/app/services/shared/nsfw.service';

const POR_PAGINA = 15;
/** Celular: "A quién seguir" y los hashtags se intercalan en el muro después de este shout (como en X). */
const SUGERENCIAS_TRAS = 5;
/** Lo que trae de una vez "Mostrar N shouts" (el máximo del API); si hay más, recarga el muro desde arriba. */
const MAX_NUEVOS_EN_LINEA = 30;
/** Cada cuánto se pregunta si hay shouts nuevos (solo con la pestaña del navegador visible). */
const AVISO_CADA_MS = 30_000;
const PESTANAS: AlcanceMuro[] = ['activos', 'todos', 'siguiendo', 'nsfw'];
const PERIODOS: PeriodoActivos[] = ['dia', 'semana', 'mes'];

/** Lista y scroll al salir de /mi: al volver con "atrás" se restauran en vez de recargar desde arriba. */
let guardado: { url: string; items: MuroItem[]; siguiente: string | null; corte: string | null; scrollY: Posicion } | null = null;

/**
 * Dónde estaba al salir: el primer shout visible y a cuántos px del borde de arriba quedaba. Volver a ese shout
 * aguanta que lo de arriba cambie de alto (imágenes, resumen, aviso de nuevos); `y` es el respaldo si no aparece.
 */
interface Posicion {
  y: number;
  ancla: { clave: string; top: number } | null;
}

/**
 * /mi: el inicio personal. Muro con los shouts propios y de quienes sigues (más lo que comparten y sus posts nuevos)
 * o "Recientes" con los shouts de todo el sitio; al costado, el resumen del usuario y a quién seguir.
 * Es pública: sin sesión se ven Recientes y los #hashtags (indexables); interactuar lleva al login.
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
  private readonly securityService = inject(IHttpSecurityService);
  private readonly confirmar = inject(ConfirmarService);
  private readonly nsfw = inject(NsfwService);
  private readonly notificaciones = inject(NotificationService);
  readonly haySesion = this.sesion.haySesion;
  /** Ya confirmó ser mayor de edad (en esta visita, o antes: queda guardado en la cuenta). */
  private nsfwConfirmado = false;

  readonly alcance = signal<AlcanceMuro>('siguiendo');
  /** Ventana de la pestaña "Más activos" (?periodo=dia|semana|mes). */
  readonly periodo = signal<PeriodoActivos>('dia');
  readonly periodos = PERIODOS;
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
  /** Lo publicado por otros en esta pestaña después de la entrada más nueva de la lista (como el "Mostrar 9 posts" de X). */
  readonly nuevos = signal(0);
  readonly autoresNuevos = signal<{ userName: string; avatar: string | null }[]>([]);
  readonly cargandoNuevos = signal(false);
  /** Ya se bajó más allá del principio del muro: el aviso pasa a ser una píldora flotante. */
  readonly lejosDelTope = signal(false);
  readonly SUGERENCIAS_TRAS = SUGERENCIAS_TRAS;
  /** Celular: composer cerrado en una línea, abierto ahí ("linea") o como hoja desde el botón + ("hoja"). En escritorio siempre se ve. */
  readonly composer = signal<'cerrado' | 'linea' | 'hoja'>('cerrado');
  /** Deslizar para recargar (TirarParaRecargarService): en curso, y con qué avisar que terminó. */
  private readonly recargando = signal(false);
  private finRecarga?: () => void;
  private readonly composerCaja = viewChild<ElementRef<HTMLElement>>('composerCaja');
  private readonly tirarParaRecargar = inject(TirarParaRecargarService);
  /** "Más activos": momento en que se armó el ranking (lo devuelve la primera página y se reenvía en las siguientes). */
  private corte: string | null = null;

  readonly resumen = signal<MiResumen | null>(null);
  readonly sugerencias = signal<(SugerenciaUsuario & { siguiendo?: boolean; procesando?: boolean })[]>([]);

  private readonly pedir = new Subject<{ reiniciar: boolean }>();
  private readonly finDeLista = viewChild<ElementRef<HTMLElement>>('finDeLista');
  private readonly muro = viewChild<ElementRef<HTMLElement>>('muro');
  private observador?: IntersectionObserver;
  /** URL de esta vista (al destruirse, router.url ya es la de destino). */
  private urlActual = '';
  private scrollAlSalir: Posicion = { y: 0, ancla: null };

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
            this.limpiarNuevos();
            this.cargando.set(true);
            this.items.set([]);
            this.siguiente.set(null);
            this.corte = null;
          } else {
            this.cargandoMas.set(true);
          }
        }),
        switchMap(({ reiniciar }) =>
          (this.alcance() === 'activos' && !this.tag()
            ? this.miService.getActivos(this.periodo(), reiniciar ? 1 : Number(this.siguiente()), POR_PAGINA, false, this.corte)
            : this.miService.getMuro(this.alcance(), reiniciar ? null : this.siguiente(), POR_PAGINA, this.tag())
          ).pipe(
            catchError(() => {
              this.error.set(true);
              this.cargando.set(false);
              this.cargandoMas.set(false);
              this.terminarRecarga();
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((muro) => {
        // Lo que ya está en la lista no se repite (un shout puede reaparecer si se borró o se movió algo entre páginas).
        this.items.update((l) => [...l, ...this.sinRepetidos(muro.items, l)]);
        this.siguiente.set(muro.siguiente);
        if (muro.corte) this.corte = muro.corte;
        this.cargando.set(false);
        this.cargandoMas.set(false);
        this.terminarRecarga();
        this.reobservarFin();
      });

    // El scroll se toma al empezar a salir: para cuando se destruye el componente la página ya subió al tope.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart), takeUntilDestroyed())
      .subscribe(() => {
        if (typeof window !== 'undefined') this.scrollAlSalir = this.tomarPosicion();
      });
    const volviendo = this.router.getCurrentNavigation()?.trigger === 'popstate';
    let primera = true;
    const aplicarRuta = (p: ParamMap, q: ParamMap): void => {
      // Por defecto Más activos; sin sesión no hay muro propio (Siguiendo cae a Recientes).
      const ver = q.get('ver');
      // ?ver=nsfw directo (enlace, recarga): primero la verificación de edad; si no pasa, a Recientes.
      if (ver === 'nsfw' && !this.nsfwConfirmado) {
        this.verificarNsfw().then((ok) => {
          if (ok) aplicarRuta(p, q);
          else this.router.navigate(['/mi'], { queryParams: { ver: 'recientes' }, replaceUrl: true });
        });
        return;
      }
      this.alcance.set(ver === 'recientes' || ver === 'novedades' ? 'todos' : ver === 'nsfw' ? 'nsfw' : ver === 'siguiendo' ? (this.haySesion ? 'siguiendo' : 'todos') : 'activos');
      const periodo = q.get('periodo') as PeriodoActivos | null;
      this.periodo.set(periodo && PERIODOS.includes(periodo) ? periodo : 'dia');
      this.tag.set((p.get('tag') ?? q.get('tag'))?.replace(/^#/, '').toLowerCase() || null);
      this.aplicarSEO();
      this.urlActual = this.router.url;
      const previo = primera && volviendo && guardado?.url === this.router.url ? guardado : null;
      primera = false;
      guardado = null;
      if (previo) {
        this.limpiarNuevos();
        this.items.set(previo.items);
        this.siguiente.set(previo.siguiente);
        this.corte = previo.corte;
        this.cargando.set(false);
        this.restaurarScroll(previo.scrollY);
        return;
      }
      this.pedir.next({ reiniciar: true });
    };
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(takeUntilDestroyed()).subscribe(([p, q]) => aplicarRuta(p, q));

    if (this.haySesion) this.miService.getResumen().pipe(takeUntilDestroyed()).subscribe((r) => this.resumen.set(r));
    this.miService.getSugerencias(5).pipe(takeUntilDestroyed()).subscribe((s) => this.sugerencias.set(s));
    this.miService.getTendencias(8, 'mejores').pipe(takeUntilDestroyed()).subscribe((t) => this.tendencias.set(t));
    this.miService.getTendencias(8, 'recientes').pipe(takeUntilDestroyed()).subscribe((t) => this.recientes.set(t));

    const signalr = inject(SignalrService);
    const token = inject(IHttpSecurityService).getCurrentUser()?.token;
    if (token) void signalr.start(token);

    afterNextRender(() => {
      // Lo nuevo no se mete solo en la lista (movería lo que estoy leyendo): se ofrece "Mostrar N shouts".
      // Se pregunta cada 30 s, al volver a la pestaña del navegador y enseguida si alguien que sigo publica (SignalR).
      const visible = () => document.visibilityState === 'visible';
      merge(interval(AVISO_CADA_MS), fromEvent(document, 'visibilitychange'), signalr.shoutNuevo$.pipe(debounceTime(1500)))
        .pipe(
          filter(() => visible() && this.claveAviso() !== null),
          switchMap(() => {
            const clave = this.claveAviso()!;
            return this.miService.getNuevos(this.alcance(), this.items()[0].fecha, this.tag()).pipe(
              // Si mientras tanto cambió la pestaña o se recargó la lista, la respuesta ya no aplica.
              filter((n) => !!n && clave === this.claveAviso()),
            );
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((n) => {
          this.nuevos.set(n!.cantidad);
          this.autoresNuevos.set(n!.autores);
        });

      // Deslizar para recargar: aquí suma lo nuevo arriba en vez de volver a crear la página.
      const quitar = this.tirarParaRecargar.registrar(() => this.refrescar(), () => this.composer() !== 'hoja');
      this.destroyRef.onDestroy(quitar);

      fromEvent(window, 'scroll', { passive: true })
        .pipe(auditTime(150), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.lejosDelTope.set((this.muro()?.nativeElement.getBoundingClientRect().top ?? 0) < 0));

      // Al acercarse al final de la lista carga la página siguiente (el botón "Cargar más" queda como respaldo).
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

  /**
   * Las imágenes cargan después y hasta entonces la página es más corta que antes: el scroll quedaría topado.
   * Se reintenta en cada frame hasta llegar (o ~2 s), y se corta si el usuario se mueve por su cuenta.
   */
  private restaurarScroll(pos: Posicion): void {
    const hasta = performance.now() + 2000;
    let cortar = false;
    let quieto = 0;
    const parar = () => (cortar = true);
    const quitar = () => {
      window.removeEventListener('wheel', parar);
      window.removeEventListener('touchstart', parar);
    };
    window.addEventListener('wheel', parar, { once: true, passive: true });
    window.addEventListener('touchstart', parar, { once: true, passive: true });
    const paso = () => {
      if (cortar) return quitar();
      const ancla = pos.ancla && document.querySelector<HTMLElement>(`[data-clave="${CSS.escape(pos.ancla.clave)}"]`);
      // Con ancla se recalcula en cada frame: si una imagen de arriba termina de cargar, el shout se corre y se corrige.
      const destino = ancla ? window.scrollY + ancla.getBoundingClientRect().top - pos.ancla!.top : pos.y;
      if (Math.abs(window.scrollY - destino) > 2) {
        window.scrollTo(0, destino);
        quieto = 0;
      } else quieto++;
      // Sin ancla basta con llegar; con ancla se sigue vigilando un rato por lo que carga tarde.
      const listo = ancla ? quieto > 30 : quieto > 0;
      if (!listo && performance.now() < hasta) requestAnimationFrame(paso);
      else quitar();
    };
    setTimeout(() => requestAnimationFrame(paso));
  }

  /** El primer elemento del muro que se ve (debajo del header fijo) y su distancia al borde de arriba. */
  private tomarPosicion(): Posicion {
    const y = window.scrollY;
    const arriba = document.querySelector('main-header')?.getBoundingClientRect().bottom ?? 0;
    const lis = this.muro()?.nativeElement.querySelectorAll<HTMLElement>('[data-clave]') ?? [];
    for (const li of Array.from(lis)) {
      const r = li.getBoundingClientRect();
      if (r.bottom > Math.max(0, arriba)) return { y, ancla: { clave: li.dataset['clave']!, top: r.top } };
    }
    return { y, ancla: null };
  }

  /** Lo que hace deslizar para recargar: suma lo nuevo arriba si se puede; si no (Más activos, lista vacía), recarga. */
  refrescar(): Promise<void> {
    this.recargando.set(true);
    const listo = new Promise<void>((r) => (this.finRecarga = r));
    if (this.claveAviso() === null) this.pedir.next({ reiniciar: true });
    else this.traerNuevos(() => this.terminarRecarga());
    return listo;
  }

  private terminarRecarga(): void {
    if (!this.recargando()) return;
    this.recargando.set(false);
    this.finRecarga?.();
    this.finRecarga = undefined;
  }

  /** Abre el composer: en la línea de arriba o como hoja sobre el muro (botón +). El foco va directo al campo. */
  abrirComposer(modo: 'linea' | 'hoja'): void {
    const caja = this.composerCaja()?.nativeElement;
    // Clases a mano antes del foco: en iOS el teclado solo se abre si el foco llega en el mismo toque.
    caja?.classList.add('is-abierto');
    if (modo === 'hoja') {
      caja?.classList.add('is-hoja');
      document.body.style.overflow = 'hidden';
    }
    caja?.querySelector<HTMLTextAreaElement>('textarea')?.focus({ preventScroll: modo === 'hoja' });
    this.composer.set(modo);
  }

  cerrarComposer(): void {
    if (this.composer() === 'hoja') document.body.style.overflow = '';
    this.composer.set('cerrado');
  }

  @HostListener('document:keydown.escape')
  alEscape(): void {
    if (this.composer() === 'hoja') this.cerrarComposer();
  }

  ngOnDestroy(): void {
    if (this.composer() === 'hoja') document.body.style.overflow = '';
    this.observador?.disconnect();
    if (typeof window !== 'undefined' && this.items().length)
      guardado = { url: this.urlActual, items: this.items(), siguiente: this.siguiente(), corte: this.corte, scrollY: this.scrollAlSalir };
  }

  /** El muro "Siguiendo" es personal (noindex); Recientes y cada #hashtag son públicos e indexables. */
  private aplicarSEO(): void {
    const tag = this.tag();
    // NSFW tampoco se indexa (contenido +18).
    const personal = !tag && (this.alcance() === 'siguiendo' || this.alcance() === 'nsfw');
    if (!tag && this.alcance() === 'activos') {
      this.seo.setSEO({
        title: 'Shouts más activos',
        description: 'Los shouts con más me gusta, comentarios y reshouts del día, la semana o el mes.',
        type: 'website',
        imageURL: '',
        tags: ['shouts', 'populares', 'comunidad'],
        noIndex: false,
        canonical: `${environment.publicUrl}/mi`,
      });
      return;
    }
    const base = `${environment.publicUrl}/mi`;
    this.seo.setSEO({
      title: tag ? `#${tag} · Shouts` : this.alcance() === 'nsfw' ? 'Shouts NSFW' : personal ? 'Mi muro' : 'Shouts: lo último de la comunidad',
      description: tag
        ? `Shouts con #${tag}: lo que la comunidad está diciendo sobre ${tag}.`
        : personal
          ? 'Tu muro: lo que comparten las personas que sigues.'
          : 'Los shouts más recientes de la comunidad: textos, fotos, videos y enlaces. Tendencias y hashtags del momento.',
      type: 'website',
      imageURL: '',
      tags: tag ? [tag, 'shouts'] : ['shouts', 'comunidad', 'tendencias'],
      noIndex: personal,
      canonical: tag ? `${environment.publicUrl}/hashtag/${encodeURIComponent(tag)}` : `${base}?ver=recientes`,
    });
  }

  async cambiarAlcance(alcance: AlcanceMuro): Promise<void> {
    if (alcance === 'siguiendo' && !this.sesion.exigir('Inicia sesión para ver tu muro')) return;
    if (alcance === this.alcance() && !this.tag()) return;
    if (alcance === 'nsfw' && !(await this.verificarNsfw())) return;
    this.router.navigate(['/mi'], {
      queryParams: { ver: alcance === 'todos' ? 'recientes' : alcance === 'activos' ? null : alcance },
      replaceUrl: !this.tag(),
    });
  }

  /**
   * NSFW: sesión, fecha de nacimiento cargada (si falta, a /cuenta para ponerla), 18+ y aceptar la advertencia.
   * La advertencia se acepta una sola vez por cuenta (Usuario.NsfwAceptado); la edad se comprueba siempre.
   */
  private async verificarNsfw(): Promise<boolean> {
    if (this.nsfwConfirmado) return true;
    if (!this.sesion.exigir('Inicia sesión para ver el contenido NSFW')) return false;

    const usuario = await firstValueFrom(this.securityService.getLoggedUserByJwt()).catch(() => null);
    const edad = edadDesde(usuario?.fechaNacimiento);
    if (edad === null) {
      this.notificaciones.info('Para ver el contenido NSFW agrega tu fecha de nacimiento en tu cuenta.', 'NSFW');
      this.router.navigate(['/cuenta']);
      return false;
    }
    if (edad < EDAD_NSFW) {
      this.notificaciones.error(`El contenido NSFW es solo para mayores de ${EDAD_NSFW} años.`, 'NSFW');
      return false;
    }

    if (usuario?.nsfwAceptado) return (this.nsfwConfirmado = true);

    this.nsfwConfirmado = await this.confirmar.confirmar({
      titulo: 'Contenido para mayores de edad',
      mensaje: `Esta sección muestra shouts marcados como NSFW, con contenido solo apto para mayores de ${EDAD_NSFW} años. ¿Quieres continuar?`,
      aceptar: `Soy mayor de ${EDAD_NSFW}, continuar`,
      cancelar: 'Volver',
      peligro: true,
    });
    // Si no se pudo guardar, solo vuelve a preguntar la próxima vez.
    if (this.nsfwConfirmado) this.nsfw.aceptarAviso().subscribe({ error: () => undefined });
    return this.nsfwConfirmado;
  }

  cambiarPeriodo(periodo: PeriodoActivos): void {
    if (periodo === this.periodo()) return;
    this.router.navigate(['/mi'], { queryParams: { periodo: periodo === 'dia' ? null : periodo }, replaceUrl: true });
  }

  /** Al terminar "Más activos", el período siguiente para seguir bajando (null en el mes). */
  periodoMasLargo(): PeriodoActivos | null {
    return this.periodo() === 'dia' ? 'semana' : this.periodo() === 'semana' ? 'mes' : null;
  }

  nombrePeriodo(periodo: PeriodoActivos): string {
    return periodo === 'dia' ? 'Hoy' : periodo === 'semana' ? 'Semana' : 'Mes';
  }

  /** Flechas entre Hoy / Semana / Mes. */
  teclaPeriodos(e: KeyboardEvent): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = PERIODOS.indexOf(this.periodo());
    const otro = PERIODOS[(i + (e.key === 'ArrowRight' ? 1 : PERIODOS.length - 1)) % PERIODOS.length];
    const lista = e.currentTarget as HTMLElement;
    this.cambiarPeriodo(otro);
    queueMicrotask(() => lista.querySelector<HTMLElement>(`[data-periodo="${otro}"]`)?.focus());
  }

  quitarTag(): void {
    this.router.navigate(['/mi'], { queryParams: { ver: this.haySesion ? null : 'recientes' } });
  }

  /**
   * Qué lista está mirando el aviso de nuevos: pestaña + entrada más nueva. Null cuando no corresponde avisar
   * ("Más activos" se ordena por actividad, no por fecha; lista vacía o cargando).
   */
  private claveAviso(): string | null {
    const primero = this.items()[0];
    if (this.cargando() || !primero || (this.alcance() === 'activos' && !this.tag())) return null;
    return `${this.alcance()}|${this.tag() ?? ''}|${primero.fecha}`;
  }

  private limpiarNuevos(): void {
    this.nuevos.set(0);
    this.autoresNuevos.set([]);
  }

  private sinRepetidos(nuevos: MuroItem[], lista: MuroItem[]): MuroItem[] {
    const claves = new Set(lista.map((i) => this.claveItem(i)));
    return nuevos.filter((i) => !claves.has(this.claveItem(i)));
  }

  /** "Mostrar 9 shouts" / "Mostrar 99+ shouts". */
  textoNuevos(): string {
    const n = this.nuevos();
    return n === 1 ? 'Mostrar 1 shout' : `Mostrar ${n >= 99 ? '99+' : n} shouts`;
  }

  /** "Mostrar N shouts": sube al principio y suma lo nuevo arriba. */
  verNuevos(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.traerNuevos();
  }

  /** Suma lo nuevo arriba sin perder lo cargado. Si es demasiado para una página, recarga desde arriba. */
  private traerNuevos(alTerminar?: () => void): void {
    if (this.cargandoNuevos()) return alTerminar?.();
    const desde = this.items()[0]?.fecha;
    if (!desde || this.nuevos() > MAX_NUEVOS_EN_LINEA) {
      this.pedir.next({ reiniciar: true });
      return;
    }
    this.cargandoNuevos.set(true);
    const clave = this.claveAviso();
    this.miService
      .getMuro(this.alcance(), null, MAX_NUEVOS_EN_LINEA, this.tag(), desde)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (muro) => {
          this.cargandoNuevos.set(false);
          alTerminar?.();
          if (clave !== this.claveAviso()) return; // cambió de pestaña mientras llegaba
          // Página llena: puede haber más entre lo nuevo y lo que ya estaba; mejor recargar que dejar un hueco.
          if (muro.siguiente) {
            this.pedir.next({ reiniciar: true });
            return;
          }
          this.limpiarNuevos();
          this.items.update((l) => [...this.sinRepetidos(muro.items, l), ...l]);
        },
        error: () => {
          this.cargandoNuevos.set(false);
          alTerminar?.();
          if (clave === this.claveAviso()) this.pedir.next({ reiniciar: true });
        },
      });
  }

  /** Flechas izquierda/derecha entre pestañas (patrón ARIA de tabs). */
  teclaPestanas(e: KeyboardEvent): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    // Sin sesión "Siguiendo" no está disponible: se salta.
    const disponibles = this.haySesion ? PESTANAS : PESTANAS.filter((p) => p !== 'siguiendo');
    const i = disponibles.indexOf(this.alcance());
    const otra = disponibles[(i + (e.key === 'ArrowRight' ? 1 : disponibles.length - 1)) % disponibles.length];
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
    this.cerrarComposer();
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

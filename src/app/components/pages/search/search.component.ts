import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { combineLatest, debounceTime, distinctUntilChanged, Subject, switchMap, of, catchError } from 'rxjs';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { TopCategoriaViewModel } from 'src/app/models/parametros/parametros-vm.model';
import {
  BusquedaPostsResultado,
  CategoriaBusqueda,
  OrdenBusqueda,
  PeriodoBusqueda,
  PostBusqueda,
  TipoBusqueda,
} from 'src/app/models/posts/busqueda.model';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';
import { DecimalPipe, DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

const CLAVE_RECIENTES = 'busquedas-recientes';
const MAX_RECIENTES = 8;
const POR_PAGINA = 10;

/** Estado de la búsqueda tal como está en la URL. */
interface EstadoBusqueda {
  q: string;
  categoria: string | null;
  tipo: TipoBusqueda;
  autor: string;
  orden: OrdenBusqueda;
  periodo: PeriodoBusqueda;
  pagina: number;
}

/**
 * Buscador (/buscar). El texto va en la ruta (/buscar/posts/:query[/:categoria], compatible con los enlaces viejos)
 * y el resto de filtros en query params (?en=&autor=&orden=&periodo=&pagina=): toda búsqueda se puede compartir y
 * el botón "atrás" funciona.
 */
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    imports: [
        FormsModule,
        RouterLink,
        MatTooltip,
        UserPopoverDirective,
        UserAvatarComponent,
        MatPaginator,
        AdsByTypeComponent,
        DecimalPipe,
        DatePipe,
        TimeAgoPipe,
    ],
})
export class SearchComponent implements OnInit {
  private postService = inject(IHttpPostsService);
  private parametrosService = inject(IHttpParametrosService);
  private displayService = inject(DisplayComponentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SEOService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly autor$ = new Subject<string>();

  public readonly tipos: { valor: TipoBusqueda; label: string; icono: string }[] = [
    { valor: 'todo', label: 'Todo', icono: 'ti-world-search' },
    { valor: 'titulo', label: 'Título', icono: 'ti-heading' },
    { valor: 'contenido', label: 'Contenido', icono: 'ti-file-text' },
    { valor: 'tags', label: 'Etiquetas', icono: 'ti-tags' },
  ];

  public readonly ordenes: { valor: OrdenBusqueda; label: string }[] = [
    { valor: 'relevancia', label: 'Relevancia' },
    { valor: 'recientes', label: 'Recientes' },
    { valor: 'puntos', label: 'Más puntos' },
    { valor: 'comentarios', label: 'Más comentados' },
  ];

  public readonly periodos: { valor: PeriodoBusqueda; label: string }[] = [
    { valor: '', label: 'Cualquier fecha' },
    { valor: 'semana', label: 'Última semana' },
    { valor: 'mes', label: 'Último mes' },
    { valor: 'anio', label: 'Último año' },
  ];

  public estado: EstadoBusqueda = SearchComponent.estadoVacio();
  /** Texto del campo (puede diferir del buscado hasta que se envía). */
  public texto = '';
  public tipoElegido: TipoBusqueda = 'todo';
  public autorTexto = '';

  public resultados: PostBusqueda[] = [];
  public categorias: CategoriaBusqueda[] = [];
  public terminos: string[] = [];
  public totalCount = 0;
  public cargando = false;
  public error = false;

  public recientes: string[] = [];
  public categoriasPopulares: TopCategoriaViewModel[] = [];

  /** Panel de filtros: abierto en escritorio, plegado en móvil. */
  public panelAbierto = typeof window === 'undefined' || window.matchMedia('(min-width: 992px)').matches;

  public readonly porPagina = POR_PAGINA;
  public readonly esqueletos = [1, 2, 3, 4];

  constructor() {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  private static estadoVacio(): EstadoBusqueda {
    return { q: '', categoria: null, tipo: 'todo', autor: '', orden: 'relevancia', periodo: '', pagina: 1 };
  }

  ngOnInit(): void {
    this.recientes = this.leerRecientes();

    this.autor$
      .pipe(debounceTime(450), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((autor) => this.navegar({ autor, pagina: 1 }));

    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        switchMap(([params, query]) => {
          this.estado = {
            q: (params.get('query') ?? '').trim(),
            categoria: params.get('categoria'),
            tipo: this.valido(query.get('en'), this.tipos.map((t) => t.valor), 'todo'),
            autor: query.get('autor') ?? '',
            orden: this.valido(query.get('orden'), this.ordenes.map((o) => o.valor), 'relevancia'),
            periodo: this.valido(query.get('periodo'), this.periodos.map((p) => p.valor), ''),
            pagina: Math.max(1, Number(query.get('pagina')) || 1),
          };
          this.texto = this.estado.q;
          this.tipoElegido = this.estado.tipo;
          this.autorTexto = this.estado.autor;
          this.actualizarSeo();

          if (!this.estado.q) {
            this.cargarInicio();
            return of(null);
          }

          this.guardarReciente(this.estado.q);
          this.cargando = true;
          this.error = false;
          return this.postService
            .buscarPosts({ ...this.estado, page: this.estado.pagina, pageCount: POR_PAGINA })
            .pipe(catchError(() => {
              this.error = true;
              return of(null);
            }));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((r: BusquedaPostsResultado | null) => {
        this.cargando = false;
        this.resultados = r?.data ?? [];
        this.categorias = r?.categorias ?? [];
        this.terminos = r?.terminos ?? [];
        this.totalCount = r?.pagination?.totalCount ?? 0;
      });
  }

  private valido<T extends string>(valor: string | null, permitidos: T[], porDefecto: T): T {
    return permitidos.includes(valor as T) ? (valor as T) : porDefecto;
  }

  get hayBusqueda(): boolean {
    return !!this.estado.q;
  }

  get hayFiltros(): boolean {
    return !!this.estado.categoria || !!this.estado.autor || !!this.estado.periodo || this.estado.tipo !== 'todo';
  }

  get categoriaActual(): CategoriaBusqueda | undefined {
    return this.categorias.find((c) => c.seo === this.estado.categoria);
  }

  get periodoActual(): string {
    return this.periodos.find((p) => p.valor === this.estado.periodo)?.label ?? '';
  }

  get tipoActual(): string {
    return this.tipos.find((t) => t.valor === this.estado.tipo)?.label ?? '';
  }

  /** Primer resultado de la página actual (1-based) para el resumen "Mostrando 11–20". */
  get desde(): number {
    return (this.estado.pagina - 1) * POR_PAGINA + 1;
  }

  get hasta(): number {
    return Math.min(this.estado.pagina * POR_PAGINA, this.totalCount);
  }

  // - Navegación: todo cambio pasa por la URL -

  buscar(texto: string = this.texto): void {
    const q = texto.trim();
    if (!q) return;
    this.navegar({ q, tipo: this.tipoElegido, pagina: 1 });
  }

  elegirTipo(tipo: TipoBusqueda): void {
    this.tipoElegido = tipo;
    if (this.hayBusqueda && this.texto.trim() === this.estado.q) this.navegar({ tipo, pagina: 1 });
  }

  elegirCategoria(seo: string | null): void {
    this.navegar({ categoria: this.estado.categoria === seo ? null : seo, pagina: 1 });
  }

  elegirOrden(orden: OrdenBusqueda): void {
    this.navegar({ orden, pagina: 1 });
  }

  elegirPeriodo(periodo: PeriodoBusqueda): void {
    this.navegar({ periodo, pagina: 1 });
  }

  onAutor(texto: string): void {
    this.autorTexto = texto;
    this.autor$.next(texto.trim());
  }

  quitarAutor(): void {
    this.autorTexto = '';
    this.autor$.next('');
  }

  limpiarFiltros(): void {
    this.navegar({ categoria: null, tipo: 'todo', autor: '', periodo: '', pagina: 1 });
  }

  pageChange(event: PageEvent): void {
    this.navegar({ pagina: event.pageIndex + 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private navegar(cambios: Partial<EstadoBusqueda>): void {
    // Se aplica ya (no al llegar la nueva URL): dos filtros seguidos no deben pisarse.
    const e = { ...this.estado, ...cambios };
    this.estado = e;
    const ruta = ['/buscar', 'posts', e.q, ...(e.categoria ? [e.categoria] : [])];
    const queryParams: Params = {
      en: e.tipo !== 'todo' ? e.tipo : null,
      autor: e.autor || null,
      orden: e.orden !== 'relevancia' ? e.orden : null,
      periodo: e.periodo || null,
      pagina: e.pagina > 1 ? e.pagina : null,
    };
    this.router.navigate(ruta, { queryParams });
  }

  // - Resaltado -

  /** Texto escapado con las palabras buscadas envueltas en <mark>. Seguro para [innerHTML]. */
  resaltar(texto: string | null | undefined): string {
    const escapado = (texto ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const palabras = this.terminos
      .map((t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'))
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .filter(Boolean);
    if (!palabras.length) return escapado;
    return escapado.replace(new RegExp(`(${palabras.join('|')})`, 'gi'), '<mark>$1</mark>');
  }

  esEtiquetaBuscada(tag: string): boolean {
    const t = tag.toLowerCase();
    return this.terminos.some((p) => t.includes(p));
  }

  // - Inicio (/buscar sin texto) -

  private cargarInicio(): void {
    this.resultados = [];
    this.totalCount = 0;
    if (this.categoriasPopulares.length) return;
    this.parametrosService
      .getTopCategorias(12)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((c) => (this.categoriasPopulares = c ?? []));
  }

  private leerRecientes(): string[] {
    try {
      const lista = JSON.parse(localStorage.getItem(CLAVE_RECIENTES) ?? '[]');
      return Array.isArray(lista) ? lista.filter((x): x is string => typeof x === 'string').slice(0, MAX_RECIENTES) : [];
    } catch {
      return [];
    }
  }

  private guardarReciente(q: string): void {
    this.recientes = [q, ...this.recientes.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECIENTES);
    try {
      localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(this.recientes));
    } catch {
      // Sin almacenamiento (modo privado): las recientes duran solo esta visita.
    }
  }

  quitarReciente(q: string, event: Event): void {
    event.stopPropagation();
    this.recientes = this.recientes.filter((r) => r !== q);
    try {
      localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(this.recientes));
    } catch {
      /* sin almacenamiento */
    }
  }

  private actualizarSeo(): void {
    // Cada búsqueda genera una URL propia: indexarlas es contenido pobre infinito que se come el presupuesto de rastreo.
    this.seoService.setSEO({
      title: this.estado.q ? `Buscar «${this.estado.q}»` : 'Buscador',
      description: 'Buscá posts en Taringa por título, contenido o etiquetas.',
      type: 'website',
      imageURL: '',
      tags: [],
      noIndex: true,
    });
  }
}

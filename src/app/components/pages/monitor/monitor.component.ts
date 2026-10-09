import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { FiltroNotificaciones, MonitorViewModel } from 'src/app/models/logs/logs-vm.model';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { TipoIconMonitorComponent } from '../../addons/tipo-icon-monitor/tipo-icon-monitor.component';
import { MatTooltip } from '@angular/material/tooltip';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

interface TipoFiltro {
  /** Nombre de TipoMonitor en el API. */
  tipo: string;
  label: string;
  /** Clase del ícono de Monitor (monac_icons). */
  icono: string;
}

interface GrupoFiltro {
  titulo: string;
  tipos: TipoFiltro[];
}

type Periodo = NonNullable<FiltroNotificaciones['periodo']>;

@Component({
    selector: 'app-monitor',
    templateUrl: './monitor.component.html',
    styleUrls: ['./monitor.component.scss'],
    imports: [
        UserAvatarComponent,
        RouterLink,
        UserPopoverDirective,
        TipoIconMonitorComponent,
        MatTooltip,
        MatPaginator,
        AdsByTypeComponent,
        DatePipe,
        TimeAgoPipe,
    ],
})
export class MonitorComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  paginationService = inject(PaginationService);
  private logsService = inject(IHttpLogsService);

  private readonly destroyRef = inject(DestroyRef);

  public readonly grupos: GrupoFiltro[] = [
    {
      titulo: 'Mis posts',
      tipos: [
        { tipo: 'Favoritos', label: 'Favoritos', icono: 'ma_star' },
        { tipo: 'Comentario', label: 'Comentarios', icono: 'ma_comment_post' },
        { tipo: 'Puntos', label: 'Puntos recibidos', icono: 'ma_points' },
      ],
    },
    {
      titulo: 'Mis comentarios',
      tipos: [
        { tipo: 'Respuestas', label: 'Respuestas', icono: 'ma_comment_resp' },
        { tipo: 'Mencion', label: 'Menciones', icono: 'ma_blue_ball' },
      ],
    },
    {
      titulo: 'Usuarios que sigo',
      tipos: [
        { tipo: 'Seguir', label: 'Nuevos seguidores', icono: 'ma_follow' },
        { tipo: 'PostNuevoUsuarioQueSigues', label: 'Posts', icono: 'ma_post' },
        { tipo: 'Recomendacion', label: 'Recomendaciones', icono: 'ma_share' },
      ],
    },
    {
      titulo: 'Posts que sigo',
      tipos: [{ tipo: 'ComentarioSiguePost', label: 'Comentarios', icono: 'ma_blue_ball' }],
    },
    {
      titulo: 'Otros',
      tipos: [
        { tipo: 'Shout', label: 'Shouts', icono: 'ma_status' },
        { tipo: 'Rango', label: 'Cambios de rango', icono: 'ma_points' },
      ],
    },
  ];

  public readonly periodos: { valor: Periodo; label: string }[] = [
    { valor: '', label: 'Todo' },
    { valor: 'hoy', label: 'Hoy' },
    { valor: 'semana', label: '7 días' },
    { valor: 'mes', label: '30 días' },
  ];

  /** Tipos marcados. Todos marcados = sin filtro de tipo (incluye tipos que no tienen casilla). */
  public seleccionados = new Set<string>(this.todosLosTipos);
  public busqueda = '';
  public soloNoLeidas = false;
  public periodo: Periodo = '';

  public notificaciones: MonitorViewModel[] = [];
  public totalCount: number = 0;
  public cargando = false;

  private readonly busqueda$ = new Subject<string>();

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {
    this.busqueda$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.aplicarFiltros());

    this.getNotificaciones();
  }

  get todosLosTipos(): string[] {
    return this.grupos.flatMap((g) => g.tipos.map((t) => t.tipo));
  }

  get todosMarcados(): boolean {
    return this.seleccionados.size === this.todosLosTipos.length;
  }

  get ningunoMarcado(): boolean {
    return this.seleccionados.size === 0;
  }

  get hayFiltros(): boolean {
    return !this.todosMarcados || !!this.busqueda.trim() || this.soloNoLeidas || !!this.periodo;
  }

  private get filtro(): FiltroNotificaciones {
    return {
      tipos: this.todosMarcados ? [] : [...this.seleccionados],
      q: this.busqueda,
      soloNoLeidas: this.soloNoLeidas,
      periodo: this.periodo,
    };
  }

  getNotificaciones(): void {
    // Sin ningún tipo marcado no hay nada que pedir (el API interpretaría "sin tipos" como "todos").
    if (this.ningunoMarcado) {
      this.notificaciones = [];
      this.totalCount = 0;
      return;
    }

    this.cargando = true;
    this.logsService.getNotificaciones(this.filtro).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.notificaciones = response?.data ?? [];
        this.totalCount = response?.pagination?.totalCount ?? 0;
        this.cargando = false;
      },
      error: () => (this.cargando = false),
    });
  }

  /** Cualquier cambio de filtro vuelve a la primera página. */
  aplicarFiltros(): void {
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getNotificaciones();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getNotificaciones();
  }

  onBuscar(texto: string): void {
    this.busqueda = texto;
    this.busqueda$.next(texto.trim());
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.busqueda$.next('');
  }

  toggleTipo(tipo: string, marcado: boolean): void {
    if (marcado) this.seleccionados.add(tipo);
    else this.seleccionados.delete(tipo);
    this.aplicarFiltros();
  }

  /** Marca o desmarca un grupo entero. */
  toggleGrupo(grupo: GrupoFiltro, marcado: boolean): void {
    for (const t of grupo.tipos) {
      if (marcado) this.seleccionados.add(t.tipo);
      else this.seleccionados.delete(t.tipo);
    }
    this.aplicarFiltros();
  }

  grupoMarcado(grupo: GrupoFiltro): boolean {
    return grupo.tipos.every((t) => this.seleccionados.has(t.tipo));
  }

  grupoParcial(grupo: GrupoFiltro): boolean {
    const n = grupo.tipos.filter((t) => this.seleccionados.has(t.tipo)).length;
    return n > 0 && n < grupo.tipos.length;
  }

  marcarTodos(marcar: boolean): void {
    this.seleccionados = new Set(marcar ? this.todosLosTipos : []);
    this.aplicarFiltros();
  }

  cambiarPeriodo(periodo: Periodo): void {
    if (this.periodo === periodo) return;
    this.periodo = periodo;
    this.aplicarFiltros();
  }

  cambiarNoLeidas(valor: boolean): void {
    if (this.soloNoLeidas === valor) return;
    this.soloNoLeidas = valor;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.seleccionados = new Set(this.todosLosTipos);
    this.busqueda = '';
    this.soloNoLeidas = false;
    this.periodo = '';
    this.aplicarFiltros();
  }
}

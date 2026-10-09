import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AppLog, AppLogFiltro, AppLogGrupo, AppLogNivel, AppLogOrigen, AppLogResumen } from 'src/app/models/logs/app-log.model';
import { IHttpAppLogsService } from 'src/app/services/interfaces/httpAppLogs.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NgClass, NgTemplateOutlet, DatePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-dashboard-logs',
    templateUrl: './dashboard-logs.component.html',
    styleUrls: ['./dashboard-logs.component.scss'],
    imports: [
        NgClass,
        MatTooltip,
        FormsModule,
        NgTemplateOutlet,
        MatPaginator,
        DatePipe,
        TimeAgoPipe,
    ],
})
export class DashboardLogsComponent implements OnInit {
  paginationService = inject(PaginationService);
  private appLogsService = inject(IHttpAppLogsService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly busqueda$ = new Subject<string>();

  public logs: AppLog[] = [];
  public totalCount = 0;
  public resumen: AppLogResumen | null = null;
  public seleccionado: AppLog | null = null;
  public cargando = false;

  public filtro: AppLogFiltro = { soloPendientes: true, nivel: '', origen: '', texto: '' };

  public readonly niveles: { valor: AppLogNivel | ''; nombre: string }[] = [
    { valor: '', nombre: 'Todos los niveles' },
    { valor: 'Critical', nombre: 'Crítico' },
    { valor: 'Error', nombre: 'Error' },
    { valor: 'Warning', nombre: 'Advertencia' },
  ];

  public readonly origenes: { valor: AppLogOrigen | ''; nombre: string }[] = [
    { valor: '', nombre: 'API y navegador' },
    { valor: 'api', nombre: 'API' },
    { valor: 'frontend', nombre: 'Navegador' },
  ];

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.cargar();
    this.busqueda$.pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef)).subscribe((texto) => {
      this.filtro.texto = texto;
      this.recargarDesdeInicio();
    });
  }

  cargar(): void {
    this.cargando = true;
    this.appLogsService
      .getLogs(this.paginationService.page, this.paginationService.pageCount, this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.logs = response?.data ?? [];
          this.totalCount = response?.pagination?.totalCount ?? 0;
          this.cargando = false;
        },
        error: () => (this.cargando = false),
      });

    this.appLogsService
      .getResumen()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resumen) => (this.resumen = resumen));
  }

  buscar(texto: string): void {
    this.busqueda$.next(texto);
  }

  cambiarPendientes(soloPendientes: boolean): void {
    if (this.filtro.soloPendientes === soloPendientes) return;
    this.filtro.soloPendientes = soloPendientes;
    this.recargarDesdeInicio();
  }

  recargarDesdeInicio(): void {
    this.seleccionado = null;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.cargar();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.cargar();
  }

  // El detalle se abre bajo su fila; si viene de "más frecuentes" y no está en esta página, se muestra aparte.
  esVisibleEnTabla(): boolean {
    return !!this.seleccionado && this.logs.some((l) => l.id === this.seleccionado!.id);
  }

  ver(log: AppLog): void {
    this.seleccionado = this.seleccionado?.id === log.id ? null : log;
  }

  verGrupo(grupo: AppLogGrupo): void {
    this.appLogsService
      .getLog(grupo.ultimoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((log) => (this.seleccionado = log));
  }

  resolver(log: AppLog, todosLosIguales: boolean): void {
    this.appLogsService
      .resolver(log.id, todosLosIguales)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cantidad) => {
        this.notificationService.success(
          cantidad === 1 ? 'Registro marcado como resuelto' : `${cantidad} registros marcados como resueltos`,
          'Logs'
        );
        this.seleccionado = null;
        this.cargar();
      });
  }

  resolverTodos(): void {
    if (!this.notificationService.confirm(`¿Marcar como resueltos los ${this.totalCount} registros pendientes de este filtro?`)) return;

    this.appLogsService
      .resolverTodos(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cantidad) => {
        this.notificationService.success(`${cantidad} registros marcados como resueltos`, 'Logs');
        this.recargarDesdeInicio();
      });
  }

  copiar(log: AppLog): void {
    const texto = [
      `[${log.nivel}] ${log.origen} · ${log.fecha}`,
      log.metodo || log.ruta ? `${log.metodo ?? ''} ${log.ruta ?? ''}`.trim() : null,
      log.mensaje,
      log.stackTrace,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard?.writeText(texto).then(
      () => this.notificationService.success('Detalle copiado al portapapeles', 'Logs'),
      () => this.notificationService.error('No se pudo copiar', 'Logs')
    );
  }

  claseNivel(nivel: AppLogNivel | null): string {
    switch (nivel) {
      case 'Critical':
        return 'bg-danger';
      case 'Error':
        return 'bg-danger-subtle text-danger-emphasis';
      default:
        return 'bg-warning text-dark';
    }
  }

  nombreNivel(nivel: AppLogNivel | null): string {
    return this.niveles.find((n) => n.valor === nivel)?.nombre ?? nivel ?? '—';
  }
}

import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { DialogReglaEliminarComponent, ReglaEliminarData, ReglaEliminarResultado } from 'src/app/components/dialogs/dialog-regla-eliminar/dialog-regla-eliminar.component';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { AccionLote, ModeracionLog, Reporte } from 'src/app/models/admin/moderacion.model';
import { IHttpModeracionService } from 'src/app/services/interfaces/httpModeracion.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dashboard-moderacion',
    templateUrl: './dashboard-moderacion.component.html',
    styleUrls: ['./dashboard-moderacion.component.scss'],
    imports: [
        FormsModule,
        NgClass,
        MatTooltip,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatPaginator,
        TimeAgoPipe,
        RouterLink,
    ],
})
export class DashboardModeracionComponent implements OnInit {
  paginationService = inject(PaginationService);
  private moderacionService = inject(IHttpModeracionService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private signalrService = inject(SignalrService);
  private securityService = inject(IHttpSecurityService);

  private readonly destroyRef = inject(DestroyRef);

  public reportes: Reporte[] = [];
  /** Reportes marcados para las acciones en lote. */
  public seleccion = new Set<number>();
  public totalCount = 0;
  public pendientes = 0;
  public soloPendientes = true;
  public tipoContenido: number | null = null;

  // Vista de bitácora de acciones de staff
  public verBitacora = false;
  public logs: ModeracionLog[] = [];
  public logsTotal = 0;

  public readonly tipos = [
    { id: null, nombre: 'Todos' },
    { id: 1, nombre: 'Posts' },
    { id: 2, nombre: 'Comentarios de post' },
    { id: 3, nombre: 'Comentarios de comunidad' },
    { id: 4, nombre: 'Comentarios de shout' },
    { id: 5, nombre: 'Comentarios de foto' },
    { id: 6, nombre: 'Shouts' },
    { id: 7, nombre: 'Mensajes privados' },
  ];

  /** Tipo 6 (shout): el API manda en contextoUrl el autor, para enlazar a /shouts/{autor}/{id}. */
  enlaceShout(reporte: { tipoContenido: number; contenidoId: number; contextoUrl?: string | null }): string[] | null {
    return reporte.tipoContenido === 6 && reporte.contextoUrl ? ['/shouts', reporte.contextoUrl, String(reporte.contenidoId)] : null;
  }

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getReportes();

    // Reportes nuevos en vivo (grupo staff).
    this.signalrService.newReport$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => {
        this.pendientes += 1;
        this.notificationService.warning(
          `${payload?.tipoContenidoNombre ?? 'Contenido'} reportado por ${payload?.reporta ?? 'un usuario'}`,
          'Nuevo reporte'
        );
        if (this.soloPendientes) {
          this.getReportes();
        }
      });

    // Otro moderador atendió un reporte que estoy viendo: se recarga para no actuar dos veces sobre lo mismo.
    this.signalrService.reporteAtendido$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ reporteId, por }) => {
        if (por === this.securityService.getCurrentUser()?.usuario?.userName) return;
        if (this.reportes.some((r) => r.id === reporteId)) this.getReportes();
      });
  }

  tipoNombre(tipo: number): string {
    return this.tipos.find((t) => t.id === tipo)?.nombre ?? '—';
  }

  getReportes(): void {
    this.moderacionService
      .getReportes(this.paginationService.page, this.paginationService.pageCount, this.tipoContenido, this.soloPendientes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.reportes = response?.data ?? [];
        this.totalCount = response?.pagination?.totalCount ?? 0;
        // La selección es de la página que se ve: al recargar se queda solo con lo que sigue en la lista.
        const visibles = new Set(this.reportes.map((r) => r.id));
        this.seleccion = new Set([...this.seleccion].filter((id) => visibles.has(id)));
        this.pendientes = response?.pendientes ?? 0;
      });
  }

  cambiarFiltro(soloPendientes: boolean): void {
    if (this.soloPendientes === soloPendientes) return;
    this.soloPendientes = soloPendientes;
    this.resetPaginaYRecargar();
  }

  cambiarTipo(tipo: number | null): void {
    if (this.tipoContenido === tipo) return;
    this.tipoContenido = tipo;
    this.resetPaginaYRecargar();
  }

  private resetPaginaYRecargar(): void {
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getReportes();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getReportes();
  }

  resolver(reporte: Reporte): void {
    this.moderacionService.resolverReporte(reporte.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (resuelto: boolean) => {
        reporte.resuelto = resuelto;
        this.notificationService.success(resuelto ? 'Reporte resuelto' : 'Reporte reabierto', 'Moderación');
      },
    });
  }

  async descartar(reporte: Reporte): Promise<void> {
    if (!await this.notificationService.confirm('¿Descartar este reporte del listado?')) return;
    this.moderacionService.descartarReporte(reporte.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('Reporte descartado', 'Moderación');
        this.getReportes();
      },
    });
  }

  /** Pide la regla del protocolo que incumple (se le cita al autor) y elimina. */
  eliminarContenido(reporte: Reporte): void {
    this.moderacionService
      .getReglasProtocolo()
      .pipe(
        switchMap((reglas) =>
          this.dialog
            .open<DialogReglaEliminarComponent, ReglaEliminarData, ReglaEliminarResultado>(DialogReglaEliminarComponent, {
              width: '520px',
              maxWidth: '95vw',
              data: { reglas, motivoDenuncia: reporte.motivo },
            })
            .afterClosed(),
        ),
        filter((regla): regla is string => regla !== undefined),
        switchMap((regla) => this.moderacionService.eliminarContenidoReportado(reporte.id, regla || null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
      next: () => {
        reporte.contenidoEliminado = true;
        reporte.resuelto = true;
        this.notificationService.success('Contenido eliminado', 'Moderación');
      },
    });
  }

  alternarSeleccion(reporte: Reporte): void {
    if (this.seleccion.has(reporte.id)) this.seleccion.delete(reporte.id);
    else this.seleccion.add(reporte.id);
  }

  get todosSeleccionados(): boolean {
    return this.reportes.length > 0 && this.reportes.every((r) => this.seleccion.has(r.id));
  }

  alternarTodos(): void {
    this.seleccion = this.todosSeleccionados ? new Set() : new Set(this.reportes.map((r) => r.id));
  }

  async atenderSeleccion(accion: AccionLote): Promise<void> {
    const ids = [...this.seleccion];
    if (ids.length === 0) return;
    const textos: Record<AccionLote, [string, string]> = {
      resolver: [`¿Marcar como resueltos ${ids.length} reporte(s)?`, 'resueltos'],
      descartar: [`¿Descartar ${ids.length} reporte(s)?`, 'descartados'],
      ocultar: [`¿Eliminar el contenido de ${ids.length} reporte(s)? Se avisará a cada autor.`, 'atendidos y su contenido eliminado'],
    };
    if (!await this.notificationService.confirm(textos[accion][0])) return;
    this.moderacionService.atenderLote(ids, accion).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (cantidad) => {
        this.notificationService.success(`${cantidad} reporte(s) ${textos[accion][1]}`, 'Moderación');
        this.seleccion.clear();
        this.getReportes();
      },
    });
  }

  /** Banear al autor del contenido reportado sin salir de la cola. */
  async banearAutor(reporte: Reporte): Promise<void> {
    if (!reporte.autorId) return;
    const { DialogBanUserComponent } = await import('src/app/components/dialogs/dialog-ban-user/dialog-ban-user.component');
    this.dialog.open(DialogBanUserComponent, { width: '860px', maxWidth: '95vw', data: { usuarioId: reporte.autorId }, disableClose: true });
  }

  toggleBitacora(): void {
    this.verBitacora = !this.verBitacora;
    if (this.verBitacora && this.logs.length === 0) {
      this.getLogs();
    }
  }

  getLogs(): void {
    this.moderacionService
      .getModeracionLogs(1, 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.logs = response?.data ?? [];
        this.logsTotal = response?.pagination?.totalCount ?? 0;
      });
  }
}

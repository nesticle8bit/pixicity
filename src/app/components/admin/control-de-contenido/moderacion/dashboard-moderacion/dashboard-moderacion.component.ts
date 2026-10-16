import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { DialogReglaEliminarComponent, ReglaEliminarData, ReglaEliminarResultado } from 'src/app/components/dialogs/dialog-regla-eliminar/dialog-regla-eliminar.component';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { ModeracionLog, Reporte } from 'src/app/models/admin/moderacion.model';
import { IHttpModeracionService } from 'src/app/services/interfaces/httpModeracion.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
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

  private readonly destroyRef = inject(DestroyRef);

  public reportes: Reporte[] = [];
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

  descartar(reporte: Reporte): void {
    if (!this.notificationService.confirm('¿Descartar este reporte del listado?')) return;
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

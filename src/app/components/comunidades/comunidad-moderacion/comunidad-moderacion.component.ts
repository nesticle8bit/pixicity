import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { Reporte } from 'src/app/models/admin/moderacion.model';
import { ComunidadDetalle, ComunidadMiembro } from 'src/app/models/comunidades/comunidad.model';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpModeracionService } from 'src/app/services/interfaces/httpModeracion.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { TimeAgoPipe } from 'src/app/shared/pipes/timeAgo.pipe';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import {
  DialogReglaEliminarComponent,
  ReglaEliminarData,
  ReglaEliminarResultado,
} from '../../dialogs/dialog-regla-eliminar/dialog-regla-eliminar.component';
import { CargandoComponent } from '../../shared/cargando/cargando.component';

type Pestana = 'denuncias' | 'equipo';

/**
 * /comunidades/:slug/moderacion: el panel del creador y del staff de la comunidad. Resuelven las denuncias de los
 * comentarios de su comunidad (eliminar citando la regla, descartar) sin depender del staff del sitio, y ven su equipo.
 */
@Component({
  selector: 'app-comunidad-moderacion',
  templateUrl: './comunidad-moderacion.component.html',
  styleUrl: './comunidad-moderacion.component.scss',
  imports: [RouterLink, TimeAgoPipe, UserAvatarComponent, CargandoComponent],
})
export class ComunidadModeracionComponent {
  private readonly comunidadesService = inject(IHttpComunidadesService);
  private readonly moderacionService = inject(IHttpModeracionService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly comunidad = signal<ComunidadDetalle | null>(null);
  readonly sinPermiso = signal(false);
  readonly pestana = signal<Pestana>('denuncias');

  readonly reportes = signal<Reporte[] | null>(null);
  readonly pendientes = signal(0);
  readonly soloPendientes = signal(true);
  readonly equipo = signal<ComunidadMiembro[] | null>(null);

  constructor() {
    inject(DisplayComponentService).setDisplay({ mainMenu: true, footer: true, searchFooter: false, submenu: true, background: '' });
    const seo = inject(SEOService);

    inject(ActivatedRoute)
      .paramMap.pipe(
        switchMap((p) => this.comunidadesService.getComunidad(p.get('slug') ?? '')),
        takeUntilDestroyed(),
      )
      .subscribe((c) => {
        this.comunidad.set(c);
        seo.setSEO({ title: `Moderación · ${c.nombre}`, description: '', type: 'website', imageURL: '', tags: [], noIndex: true });
        if (!c.puedoModerar) {
          this.sinPermiso.set(true);
          return;
        }
        this.cargarReportes();
        this.cargarEquipo();
      });
  }

  cambiarPestana(p: Pestana): void {
    this.pestana.set(p);
  }

  alternarFiltro(): void {
    this.soloPendientes.update((v) => !v);
    this.cargarReportes();
  }

  cargarReportes(): void {
    const c = this.comunidad();
    if (!c) return;
    this.reportes.set(null);
    this.moderacionService
      .getReportesComunidad(c.id, this.soloPendientes())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.reportes.set(r.reportes);
          this.pendientes.set(r.pendientes);
        },
        error: () => {
          this.reportes.set([]);
          this.sinPermiso.set(true);
        },
      });
  }

  private cargarEquipo(): void {
    const c = this.comunidad();
    if (!c) return;
    this.comunidadesService
      .getMiembros(c.id, { page: 1, pageCount: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.equipo.set((r.data ?? []).filter((m) => m.esStaff)));
  }

  eliminar(reporte: Reporte): void {
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
      .subscribe(() => {
        this.notificationService.success('Comentario eliminado. Le avisamos al autor qué regla incumplía.', 'Moderación');
        this.quitar(reporte, { resuelto: true, contenidoEliminado: true });
      });
  }

  descartar(reporte: Reporte): void {
    this.moderacionService
      .descartarReporte(reporte.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.quitar(reporte, null));
  }

  marcarResuelto(reporte: Reporte): void {
    this.moderacionService
      .resolverReporte(reporte.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resuelto) => this.quitar(reporte, { resuelto }));
  }

  /** Con "solo pendientes" el reporte resuelto sale de la lista; si se ven todos, se actualiza en el lugar. */
  private quitar(reporte: Reporte, cambios: Partial<Reporte> | null): void {
    if (!reporte.resuelto) this.pendientes.update((n) => Math.max(0, n - 1));
    this.reportes.update((l) =>
      (l ?? [])
        .map((r) => (r.id === reporte.id && cambios ? { ...r, ...cambios } : r))
        .filter((r) => r.id !== reporte.id || (cambios !== null && !(this.soloPendientes() && cambios.resuelto))),
    );
  }

  enlace(reporte: Reporte): string | null {
    return reporte.contextoUrl?.startsWith('/') ? reporte.contextoUrl : null;
  }
}

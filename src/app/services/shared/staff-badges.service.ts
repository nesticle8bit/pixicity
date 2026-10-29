import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { debounceTime, filter, interval, merge, Subject, Subscription } from 'rxjs';
import { StaffPendientes } from 'src/app/models/admin/dashboard.model';
import { IHttpGeneralService } from '../interfaces/httpGeneral.interface';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { enNavegador } from '../../shared/helpers/plataforma';
import { SignalrService } from './signalr.service';

// Respaldo por si el realtime está caído (contacto y errores no llegan por SignalR).
const REFRESCO_MS = 2 * 60 * 1000;

/**
 * Globos de las pestañas Moderación y Administración: lo pendiente para el staff.
 * Moderación = reportes + apelaciones; Administración = contacto + errores de las últimas 24 h (sin repetir lo de moderación).
 */
@Injectable({ providedIn: 'root' })
export class StaffBadgesService {
  private readonly general = inject(IHttpGeneralService);
  private readonly security = inject(IHttpSecurityService);
  private readonly signalr = inject(SignalrService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly pendientes = signal<StaffPendientes | null>(null);
  private readonly refrescar$ = new Subject<void>();
  private activo?: Subscription;

  readonly moderacion = computed(() => (this.pendientes()?.reportes ?? 0) + (this.pendientes()?.apelaciones ?? 0));
  readonly administracion = computed(() => (this.pendientes()?.contactos ?? 0) + (this.pendientes()?.errores24h ?? 0));

  constructor() {
    if (!enNavegador()) return;
    this.security
      .getCurrentUserAsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => {
        const staff = u?.usuario?.rango === 'Moderador' || u?.usuario?.rango === 'Administrador';
        if (staff && !this.activo) this.iniciar();
        else if (!staff) this.detener();
      });
  }

  /** Pide los contadores de nuevo (p. ej. tras atender algo desde el panel). */
  refrescar(): void {
    this.refrescar$.next();
  }

  private iniciar(): void {
    this.activo = merge(
      this.refrescar$,
      interval(REFRESCO_MS).pipe(filter(() => !document.hidden)),
      this.signalr.newReport$,
      this.signalr.reporteAtendido$,
      // Al atender contacto/errores/apelaciones en el panel no hay evento: se recalcula al moverse por él.
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd && /^\/(administracion|moderacion)/.test(e.urlAfterRedirects))),
    )
      .pipe(debounceTime(800))
      .subscribe(() => this.cargar());
    this.cargar();
  }

  private detener(): void {
    this.activo?.unsubscribe();
    this.activo = undefined;
    this.pendientes.set(null);
  }

  private cargar(): void {
    this.general.getPendientesStaff().subscribe({
      next: (p) => this.pendientes.set(p),
      error: () => {},
    });
  }
}

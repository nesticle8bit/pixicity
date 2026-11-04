import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { describirRegla, Medalla, ReglaMedalla, srcMedalla } from 'src/app/models/seguridad/medalla.model';
import { IHttpMedallasService } from 'src/app/services/interfaces/httpMedallas.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { DialogMedallaComponent } from '../dialog-medalla/dialog-medalla.component';
import { DialogMedallaUsuariosComponent } from '../dialog-medalla-usuarios/dialog-medalla-usuarios.component';

/** Panel de medallas: catálogo (crear, editar, activar, borrar) y a quién se le otorga cada una. */
@Component({
  selector: 'app-dashboard-medallas',
  templateUrl: './dashboard-medallas.component.html',
  styleUrl: './dashboard-medallas.component.scss',
  imports: [FormsModule, MatButton, MatIconButton, MatIcon, MatTooltip],
})
export class DashboardMedallasComponent implements OnInit {
  private readonly medallasService = inject(IHttpMedallasService);
  private readonly dialog = inject(MatDialog);
  private readonly notificaciones = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly medallas = signal<Medalla[]>([]);
  readonly cargando = signal(true);
  readonly busqueda = signal('');
  readonly src = srcMedalla;

  /** El catálogo es chico: se filtra en el navegador por título, identificador o nivel. */
  readonly filtradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return q
      ? this.medallas().filter((m) => `${m.titulo} ${m.slug} ${m.nivel} ${this.regla(m)}`.toLowerCase().includes(q))
      : this.medallas();
  });

  readonly reglas = signal<ReglaMedalla[]>([]);
  readonly repartiendo = signal(false);

  ngOnInit(): void {
    this.cargar();
    this.medallasService.getReglas().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.reglas.set(r?.reglas ?? []), error: () => this.reglas.set([]) });
  }

  regla(m: Medalla): string {
    return describirRegla(m, this.reglas());
  }

  /** El API lo hace solo cada hora; esto adelanta la pasada (útil al crear una regla nueva). */
  repartir(): void {
    if (this.repartiendo()) return;
    this.repartiendo.set(true);
    this.medallasService.repartir().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (n) => {
        this.repartiendo.set(false);
        this.notificaciones.success(n ? `Se entregaron ${n} medallas` : 'No había medallas pendientes', 'Medallas');
        if (n) this.cargar();
      },
      error: (e: unknown) => {
        this.repartiendo.set(false);
        this.notificaciones.error(e instanceof Error ? e.message : 'No se pudo repartir', 'Medallas');
      },
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.medallasService.getCatalogo().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (lista) => { this.medallas.set(lista ?? []); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  editar(medalla: Medalla | null = null): void {
    this.dialog.open(DialogMedallaComponent, { width: '560px', maxWidth: '95vw', data: medalla })
      .afterClosed().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((guardada) => { if (guardada) this.cargar(); });
  }

  usuarios(medalla: Medalla): void {
    this.dialog.open(DialogMedallaUsuariosComponent, { width: '620px', maxWidth: '95vw', data: medalla })
      .afterClosed().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cargar());
  }

  alternarActiva(medalla: Medalla): void {
    this.medallasService.guardar({ ...medalla, activa: !medalla.activa }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.medallas.update((lista) => lista.map((m) => (m.id === medalla.id ? { ...m, activa: !m.activa } : m))),
      error: (e: unknown) => this.notificaciones.error(e instanceof Error ? e.message : 'No se pudo cambiar', 'Medallas'),
    });
  }

  async eliminar(medalla: Medalla): Promise<void> {
    const aviso = medalla.otorgadas
      ? `¿Borrar «${medalla.titulo}»? Se les quita a los ${medalla.otorgadas} usuarios que la tienen. Para ocultarla sin perderlas, desactívala.`
      : `¿Borrar «${medalla.titulo}»?`;
    if (!(await this.notificaciones.confirm(aviso))) return;
    this.medallasService.eliminar(medalla.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.medallas.update((lista) => lista.filter((m) => m.id !== medalla.id));
        this.notificaciones.success('Medalla borrada', 'Medallas');
      },
      error: (e: unknown) => this.notificaciones.error(e instanceof Error ? e.message : 'No se pudo borrar', 'Medallas'),
    });
  }
}

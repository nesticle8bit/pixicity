import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { finalize } from 'rxjs';
import { Apelacion, EstadoApelacion } from 'src/app/models/admin/moderacion.model';
import { IHttpModeracionService } from 'src/app/services/interfaces/httpModeracion.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

/** Cola de apelaciones: aceptar revierte la acción (restaura el contenido o levanta el baneo); rechazar pide explicación. */
@Component({
  selector: 'app-moderacion-apelaciones',
  templateUrl: './moderacion-apelaciones.component.html',
  styleUrls: ['./moderacion-apelaciones.component.scss'],
  imports: [MatPaginator, TimeAgoPipe],
})
export class ModeracionApelacionesComponent implements OnInit {
  private moderacionService = inject(IHttpModeracionService);
  private notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Descartar es solo para admins (el API lo vuelve a verificar). */
  readonly esAdmin = inject(IHttpSecurityService).getCurrentUser()?.usuario?.rango === 'Administrador';
  readonly Estado = EstadoApelacion;
  readonly apelaciones = signal<Apelacion[]>([]);
  readonly total = signal(0);
  readonly pendientes = signal(0);
  readonly cargando = signal(false);

  public soloPendientes = true;
  public pageIndex = 0;
  public readonly pageSize = 20;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.moderacionService
      .getApelaciones(this.pageIndex + 1, this.pageSize, this.soloPendientes)
      .pipe(finalize(() => this.cargando.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((pagina) => {
        this.apelaciones.set(pagina?.data ?? []);
        this.total.set(pagina?.pagination?.totalCount ?? 0);
        this.pendientes.set(pagina?.pendientes ?? 0);
      });
  }

  filtrar(soloPendientes: boolean): void {
    this.soloPendientes = soloPendientes;
    this.pageIndex = 0;
    this.cargar();
  }

  pageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.cargar();
  }

  async aceptar(a: Apelacion): Promise<void> {
    const revierte = a.accionNombre?.toLowerCase().includes('baneado') ? 'se levanta el baneo' : 'se restaura el contenido';
    if (!await this.notificationService.confirm(`¿Aceptar la apelación de ${a.userName}? Al aceptarla ${revierte}.`)) return;
    const respuesta = await this.notificationService.prompt('Mensaje para el usuario (opcional):') ?? '';
    this.resolver(a, true, respuesta);
  }

  async rechazar(a: Apelacion): Promise<void> {
    const respuesta = await this.notificationService.prompt(`¿Por qué se mantiene la decisión? (le llega a ${a.userName})`);
    if (!respuesta?.trim()) return;
    this.resolver(a, false, respuesta);
  }

  async descartar(a: Apelacion): Promise<void> {
    if (!await this.notificationService.confirm(
      `¿Descartar la apelación de ${a.userName}? Se cierra sin revertir nada y sin avisarle a nadie.`)) return;
    this.moderacionService
      .descartarApelacion(a.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.notificationService.success('Apelación descartada', 'Moderación');
        this.cargar();
      });
  }

  private resolver(a: Apelacion, aceptar: boolean, respuesta: string): void {
    this.moderacionService
      .resolverApelacion(a.id, aceptar, respuesta)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.notificationService.success(aceptar ? 'Apelación aceptada: la acción se revirtió' : 'Apelación rechazada', 'Moderación');
        this.cargar();
      });
  }
}

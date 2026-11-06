import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, LowerCasePipe, NgStyle, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { AdminDashboardService } from 'src/app/services/shared/adminDashboard.service';
import { DashboardMetrica, DashboardPendiente, DashboardResumen, DashboardSerieDia } from 'src/app/models/admin/dashboard.model';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

type ClaveMetrica = 'comentarios' | 'posts' | 'shouts' | 'usuarios';

interface Metrica {
  clave: ClaveMetrica;
  titulo: string;
  ruta: string;
  datos: DashboardMetrica;
}

/** Un pendiente es urgente cuando lleva más de 48 h sin atender. */
const HORAS_URGENTE = 48;

/** Portada del panel: primero lo que espera al staff, después cómo va la comunidad. */
@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss'],
  imports: [MatIcon, RouterLink, MatTooltip, UserAvatarComponent, UserPopoverDirective, NgStyle, LowerCasePipe, DecimalPipe, PercentPipe, DatePipe, TimeAgoPipe],
})
export class DashboardAdminComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardService = inject(AdminDashboardService);

  public resumen: DashboardResumen | null = null;
  public cargando = false;
  public error: string | null = null;
  public actualizado: Date | null = null;
  public metricaActiva: ClaveMetrica = 'comentarios';

  public readonly accesos = [
    { titulo: 'Usuarios', icono: 'group', ruta: '/administracion/usuarios' },
    { titulo: 'Medallas', icono: 'military_tech', ruta: '/administracion/medallas' },
    { titulo: 'Publicidad', icono: 'campaign', ruta: '/administracion/publicidad' },
    { titulo: 'Estadísticas', icono: 'analytics', ruta: '/administracion/estadisticas' },
    { titulo: 'Sesiones', icono: 'devices', ruta: '/administracion/sesiones' },
    { titulo: 'Configuración', icono: 'settings', ruta: '/administracion/configuracion' },
  ];

  ngOnInit(): void {
    this.dashboardService.resumen$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => (this.resumen = r));
    this.dashboardService.cargando$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((c) => (this.cargando = c));
    this.dashboardService.error$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => (this.error = e));
    this.dashboardService.actualizado$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((a) => (this.actualizado = a));

    this.dashboardService.cargarSiHaceFalta();
  }

  refrescar(): void {
    this.dashboardService.refrescar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  get metricas(): Metrica[] {
    if (!this.resumen) return [];
    return [
      { clave: 'comentarios', titulo: 'Comentarios', ruta: '/administracion/comentarios', datos: this.resumen.comentarios },
      { clave: 'posts', titulo: 'Posts', ruta: '/administracion/posts', datos: this.resumen.posts },
      { clave: 'shouts', titulo: 'Shouts', ruta: '/administracion/shouts', datos: this.resumen.shouts },
      { clave: 'usuarios', titulo: 'Usuarios nuevos', ruta: '/administracion/usuarios', datos: this.resumen.usuarios },
    ];
  }

  get tituloMetrica(): string {
    return this.metricas.find((m) => m.clave === this.metricaActiva)?.titulo ?? '';
  }

  get rutaMetrica(): string {
    return this.metricas.find((m) => m.clave === this.metricaActiva)?.ruta ?? '/administracion';
  }

  get serie(): DashboardSerieDia[] {
    return this.resumen?.serie ?? [];
  }

  private get valores(): number[] {
    return this.serie.map((d) => d[this.metricaActiva] ?? 0);
  }

  valorDia(dia: DashboardSerieDia): number {
    return dia[this.metricaActiva] ?? 0;
  }

  get picoSerie(): number {
    return Math.max(1, ...this.valores);
  }

  /** Puntos del gráfico en un lienzo de 100 × 100; el SVG lo estira al ancho disponible. */
  private get puntos(): string[] {
    const valores = this.valores;
    const ultimo = Math.max(1, valores.length - 1);
    return valores.map((v, i) => `${((i / ultimo) * 100).toFixed(2)},${(96 - (v / this.picoSerie) * 90).toFixed(2)}`);
  }

  get linea(): string {
    return this.puntos.join(' ');
  }

  get area(): string {
    return this.puntos.length ? `0,100 ${this.linea} 100,100` : '';
  }

  /** Resumen del gráfico para lectores de pantalla. */
  get descripcionGrafico(): string {
    const total = this.valores.reduce((suma, v) => suma + v, 0);
    return `${this.tituloMetrica}: ${total} en 14 días, con un máximo de ${this.picoSerie} en un día.`;
  }

  get pendienteMasViejo(): DashboardPendiente | null {
    const pendientes = this.resumen?.pendientes ?? [];
    return pendientes.reduce<DashboardPendiente | null>((viejo, p) => ((p.esperaHoras ?? 0) > (viejo?.esperaHoras ?? -1) ? p : viejo), null);
  }

  /** Color de la franja: lo que el staff debe saber antes de leer nada. */
  get estado(): 'aldia' | 'pendiente' | 'urgente' {
    if (!this.resumen?.totalPendientes) return 'aldia';
    return this.esUrgente(this.pendienteMasViejo?.esperaHoras ?? null) ? 'urgente' : 'pendiente';
  }

  get titular(): string {
    const total = this.resumen?.totalPendientes ?? 0;
    if (total === 0) return 'Todo al día';
    return total === 1 ? '1 pendiente espera respuesta' : `${total} pendientes esperan respuesta`;
  }

  get subtitular(): string {
    const viejo = this.pendienteMasViejo;
    if (!viejo) return 'No hay denuncias, apelaciones ni mensajes de contacto sin atender.';
    return `El más antiguo llegó ${this.espera(viejo.esperaHoras)}.`;
  }

  /** Parte del récord que representa la gente conectada ahora. */
  get proporcionRecord(): number {
    if (!this.resumen?.recordOnline) return 0;
    return Math.min(100, Math.round((this.resumen.onlineTotal / this.resumen.recordOnline) * 100));
  }

  espera(horas: number | null): string {
    if (horas === null || horas === undefined) return '';
    if (horas < 1) return 'hace minutos';
    if (horas < 24) return `hace ${Math.floor(horas)} h`;
    return `hace ${Math.floor(horas / 24)} d`;
  }

  esUrgente(horas: number | null): boolean {
    return (horas ?? 0) >= HORAS_URGENTE;
  }

  postUrl(post: { categoriaSeo: string; id: number; url: string }): string {
    return `/posts/${post.categoriaSeo}/${post.id}/${post.url}`;
  }
}

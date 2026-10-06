import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminDashboardService } from 'src/app/services/shared/adminDashboard.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import {
  DashboardMetrica,
  DashboardResumen,
  DashboardSerieDia,
} from 'src/app/models/admin/dashboard.model';

interface KpiCard {
  clave: 'usuarios' | 'posts' | 'comentarios' | 'shouts';
  titulo: string;
  icono: string;
  color: string;
  ruta: string;
  metrica: DashboardMetrica;
  serie: number[];
}

interface AccesoRapido {
  titulo: string;
  icono: string;
  ruta: string;
}

@Component({
  standalone: false,
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss'],
})
export class DashboardAdminComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardService = inject(AdminDashboardService);
  private readonly securityService = inject(IHttpSecurityService);

  public currentUser?: JwtUserModel;
  public resumen: DashboardResumen | null = null;
  public cargando = false;
  public error: string | null = null;
  public actualizado: Date | null = null;

  public readonly accesos: AccesoRapido[] = [
    { titulo: 'Moderación', icono: 'shield', ruta: '/administracion/moderacion' },
    { titulo: 'Usuarios', icono: 'group', ruta: '/administracion/usuarios' },
    { titulo: 'Posts', icono: 'fact_check', ruta: '/administracion/posts' },
    { titulo: 'Comentarios', icono: 'message', ruta: '/administracion/comentarios' },
    { titulo: 'Estadísticas', icono: 'analytics', ruta: '/administracion/estadisticas' },
    { titulo: 'Configuración', icono: 'settings', ruta: '/administracion/configuracion' },
  ];

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();

    this.dashboardService.resumen$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => (this.resumen = r));
    this.dashboardService.cargando$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((c) => (this.cargando = c));
    this.dashboardService.error$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => (this.error = e));
    this.dashboardService.actualizado$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((a) => (this.actualizado = a));

    this.dashboardService.cargarSiHaceFalta();
  }

  refrescar(): void {
    this.dashboardService.refrescar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  get saludo(): string {
    const hora = new Date().getHours();

    if (hora < 6) return 'Buenas noches';
    if (hora < 13) return 'Buenos días';
    if (hora < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get kpis(): KpiCard[] {
    if (!this.resumen) return [];

    const serie = this.resumen.serie ?? [];

    return [
      {
        clave: 'usuarios',
        titulo: 'Usuarios',
        icono: 'group',
        color: '#0B6EA5',
        ruta: '/administracion/usuarios',
        metrica: this.resumen.usuarios,
        serie: serie.map((d: DashboardSerieDia) => d.usuarios),
      },
      {
        clave: 'posts',
        titulo: 'Posts',
        icono: 'fact_check',
        color: '#1e8f5a',
        ruta: '/administracion/posts',
        metrica: this.resumen.posts,
        serie: serie.map((d: DashboardSerieDia) => d.posts),
      },
      {
        clave: 'comentarios',
        titulo: 'Comentarios',
        icono: 'message',
        color: '#b8730a',
        ruta: '/administracion/comentarios',
        metrica: this.resumen.comentarios,
        serie: serie.map((d: DashboardSerieDia) => d.comentarios),
      },
      {
        clave: 'shouts',
        titulo: 'Shouts',
        icono: 'question_answer',
        color: '#7d4bc3',
        ruta: '/administracion/shouts',
        metrica: this.resumen.shouts,
        serie: [],
      },
    ];
  }

  /** Pico de la serie, para dimensionar las barras del gráfico de actividad. */
  get maxSerie(): number {
    if (!this.resumen?.serie?.length) return 1;

    return Math.max(
      1,
      ...this.resumen.serie.map((d) => Math.max(d.posts, d.comentarios, d.usuarios)),
    );
  }

  alturaBarra(valor: number): number {
    return Math.round((valor / this.maxSerie) * 100);
  }

  espera(horas: number | null): string {
    if (horas === null || horas === undefined) return '';
    if (horas < 1) return 'hace minutos';
    if (horas < 24) return `hace ${Math.floor(horas)} h`;

    return `hace ${Math.floor(horas / 24)} d`;
  }

  /** Un pendiente se marca urgente cuando lleva más de 48 h sin atender. */
  esUrgente(horas: number | null): boolean {
    return (horas ?? 0) >= 48;
  }

  postUrl(post: { categoriaSeo: string; id: number; url: string }): string {
    return `/posts/${post.categoriaSeo}/${post.id}/${post.url}`;
  }

  trackByClave = (_: number, item: { clave: string }) => item.clave;
  trackById = (_: number, item: { id: number }) => item.id;
}

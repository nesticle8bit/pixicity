import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminDashboardService } from 'src/app/services/shared/adminDashboard.service';

interface AdminMenuItem {
  titulo: string;
  icono: string;
  ruta: string;
  /** Clave de la cola de moderación cuyo contador se pinta como badge. */
  badge?: string;
  /** Suma de todas las claves de la cola (usado por "Moderación"). */
  badgeTotal?: boolean;
}

interface AdminMenuGrupo {
  titulo: string;
  icono: string;
  items: AdminMenuItem[];
}

const ESTADO_GRUPOS_KEY = 'admin-menu-grupos-cerrados';

@Component({
  standalone: false,
  selector: 'app-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss'],
})
export class DashboardSidebarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly dashboardService = inject(AdminDashboardService);

  public urlActual = '';
  public filtro = '';
  public abiertoMovil = false;
  public cerrados = new Set<string>();

  public readonly grupos: AdminMenuGrupo[] = [
    {
      titulo: 'General',
      icono: 'tune',
      items: [
        { titulo: 'Dashboard', icono: 'home', ruta: '/administracion/dashboard' },
        { titulo: 'Configuración', icono: 'settings', ruta: '/administracion/configuracion' },
        { titulo: 'Publicidad', icono: 'payments', ruta: '/administracion/publicidad' },
        { titulo: 'Estadísticas', icono: 'analytics', ruta: '/administracion/estadisticas' },
        { titulo: 'Logs del sistema', icono: 'bug_report', ruta: '/administracion/logs' },
      ],
    },
    {
      titulo: 'Moderación',
      icono: 'shield',
      items: [
        { titulo: 'Panel de moderación', icono: 'shield', ruta: '/administracion/moderacion', badgeTotal: true },
        { titulo: 'Censuras', icono: 'warning', ruta: '/administracion/censuras' },
      ],
    },
    {
      titulo: 'Contenido',
      icono: 'fact_check',
      items: [
        { titulo: 'Posts', icono: 'fact_check', ruta: '/administracion/posts' },
        { titulo: 'Comentarios', icono: 'message', ruta: '/administracion/comentarios' },
        { titulo: 'Shouts', icono: 'question_answer', ruta: '/administracion/shouts' },
        { titulo: 'Fotos', icono: 'photo_library', ruta: '/administracion/fotos' },
        { titulo: 'Noticias', icono: 'feed', ruta: '/administracion/noticias' },
        { titulo: 'Páginas', icono: 'document_scanner', ruta: '/administracion/paginas' },
        { titulo: 'Votos', icono: 'how_to_vote', ruta: '/administracion/votos' },
        { titulo: 'Monitor', icono: 'notifications_active', ruta: '/administracion/monitor' },
      ],
    },
    {
      titulo: 'Comunidad',
      icono: 'groups',
      items: [
        { titulo: 'Comunidades', icono: 'groups', ruta: '/administracion/comunidades-categorias' },
        { titulo: 'Categorías', icono: 'category', ruta: '/administracion/categorias' },
        { titulo: 'Afiliados', icono: 'directions', ruta: '/administracion/afiliados' },
        { titulo: 'Países', icono: 'flag', ruta: '/administracion/paises' },
      ],
    },
    {
      titulo: 'Usuarios',
      icono: 'group',
      items: [
        { titulo: 'Usuarios', icono: 'group', ruta: '/administracion/usuarios' },
        { titulo: 'Rangos', icono: 'badge', ruta: '/administracion/rango-usuarios' },
        { titulo: 'Sesiones', icono: 'manage_accounts', ruta: '/administracion/sesiones' },
      ],
    },
    {
      titulo: 'Buzón',
      icono: 'email',
      items: [
        { titulo: 'Contacto', icono: 'contact_page', ruta: '/administracion/contacto', badge: 'contactos' },
        { titulo: 'Mensajes', icono: 'email', ruta: '/administracion/mensajes' },
      ],
    },
  ];

  ngOnInit(): void {
    this.urlActual = this.router.url;
    this.restaurarEstado();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        this.urlActual = (e as NavigationEnd).urlAfterRedirects;
        this.abiertoMovil = false;
      });

    // El resumen ya trae todos los contadores: el sidebar sólo se suscribe al estado compartido.
    this.dashboardService.resumen$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.dashboardService.cargarSiHaceFalta();
  }

  esActivo(ruta: string): boolean {
    return this.urlActual === ruta || this.urlActual.startsWith(`${ruta}/`);
  }

  badge(item: AdminMenuItem): number {
    if (item.badgeTotal) return this.dashboardService.resumen?.totalPendientes ?? 0;
    if (!item.badge) return 0;

    return this.dashboardService.pendientesPorClave(item.badge);
  }

  /** Ítems del grupo que pasan el filtro de texto. */
  itemsVisibles(grupo: AdminMenuGrupo): AdminMenuItem[] {
    const q = this.filtro.trim().toLowerCase();

    if (!q) return grupo.items;

    return grupo.items.filter((i) => i.titulo.toLowerCase().includes(q));
  }

  grupoVisible(grupo: AdminMenuGrupo): boolean {
    return this.itemsVisibles(grupo).length > 0;
  }

  /** Con filtro activo se ignora el plegado para no esconder resultados. */
  grupoAbierto(grupo: AdminMenuGrupo): boolean {
    if (this.filtro.trim()) return true;

    return !this.cerrados.has(grupo.titulo);
  }

  alternarGrupo(grupo: AdminMenuGrupo): void {
    if (this.cerrados.has(grupo.titulo)) this.cerrados.delete(grupo.titulo);
    else this.cerrados.add(grupo.titulo);

    this.guardarEstado();
  }

  pendientesGrupo(grupo: AdminMenuGrupo): number {
    if (this.grupoAbierto(grupo)) return 0;

    return grupo.items.filter((i) => !i.badgeTotal).reduce((total, i) => total + this.badge(i), 0);
  }

  get sinResultados(): boolean {
    return !!this.filtro.trim() && !this.grupos.some((g) => this.grupoVisible(g));
  }

  limpiarFiltro(): void {
    this.filtro = '';
  }

  private restaurarEstado(): void {
    try {
      const guardado = localStorage.getItem(ESTADO_GRUPOS_KEY);
      if (guardado) this.cerrados = new Set<string>(JSON.parse(guardado));
    } catch {
      this.cerrados = new Set<string>();
    }
  }

  private guardarEstado(): void {
    try {
      localStorage.setItem(ESTADO_GRUPOS_KEY, JSON.stringify([...this.cerrados]));
    } catch {
      // localStorage puede fallar en modo privado: el plegado simplemente no persiste.
    }
  }
}

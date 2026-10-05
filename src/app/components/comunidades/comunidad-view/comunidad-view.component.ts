import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';

@Component({
  standalone: false,
  selector: 'app-comunidad-view',
  templateUrl: './comunidad-view.component.html',
  styleUrls: ['./comunidad-view.component.scss'],
})
export class ComunidadViewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public comunidad: any = null;
  public temas: any[] = [];
  public miembros: any[] = [];
  public topTemas: any[] = [];
  public comentariosRecientes: any[] = [];
  public periodoTop: string = 'Semana';
  public currentUser: any;
  public loading: boolean = true;
  public verMas: boolean = false;
  public slug: string = '';
  public queryTemas: string = '';
  public pageTemas: number = 1;
  public paginationTemas: any = {};

  constructor(
    private displayService: DisplayComponentService,
    private comunidadesService: IHttpComunidadesService,
    private securityService: IHttpSecurityService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private seoService: SEOService
  ) {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.slug = params['slug'];
      this.loadComunidad();
    });

    // ?page= sobre el listado de temas: antes solo se veian los 20 primeros y
    // el resto no tenia ningun enlace entrante.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = Number(params.get('page')) || 1;
      if (page === this.pageTemas) {
        return;
      }

      this.pageTemas = page;
      if (this.comunidad?.id) {
        this.loadTemas();
      }
    });
  }

  loadComunidad(): void {
    this.loading = true;
    this.comunidadesService.getComunidad(this.slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value) => {
        this.comunidad = value;
        this.loading = false;
        this.seoService.setSEO({
          title: this.comunidad.nombre,
          description: this.comunidad.descripcion || `Comunidad ${this.comunidad.nombre} en Taringa. Únete, participa en sus temas y comparte con la comunidad.`,
          type: 'website',
          imageURL: this.comunidad.imagen || this.comunidad.avatar || '',
          tags: [this.comunidad.nombre, 'comunidad', 'taringas'],
          canonical: `${location.origin}${location.pathname}`,
          jsonLd: {
            '@context': 'https://schema.org',
            '@graph': [{
              '@type': 'CollectionPage',
              name: this.comunidad.nombre,
              description: this.comunidad.descripcion || undefined,
              url: `${location.origin}${location.pathname}`,
              image: this.comunidad.imagen || this.comunidad.avatar || undefined,
              isPartOf: { '@id': `${location.origin}/#website` },
              dateCreated: this.comunidad.fechaRegistro,
            }, {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Taringa!', item: `${location.origin}/` },
                { '@type': 'ListItem', position: 2, name: 'Comunidades', item: `${location.origin}/comunidades` },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: this.comunidad.nombre,
                  item: `${location.origin}${location.pathname}`,
                },
              ],
            }],
          },
        });
        this.loadTemas();
        this.loadMiembros();
        this.loadTopTemas();
        this.loadComentariosRecientes();
      },
      error: () => {
        this.loading = false;
        this.seoService.setSEO({
          title: 'Comunidad no encontrada',
          description: 'Esta comunidad no existe o fue eliminada.',
          type: 'website',
          imageURL: '',
          tags: [],
          noIndex: true,
          statusCode: 404,
        });
      },
    });
  }

  loadTemas(): void {
    this.comunidadesService.getTemas(this.comunidad.id, { page: this.pageTemas, pageCount: 20, query: this.queryTemas })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => {
        this.temas = r?.data ?? [];
        this.paginationTemas = r?.pagination ?? {};
      });
  }

  buscarTemas(): void {
    this.pageTemas = 1;
    this.loadTemas();
  }

  queryParamsPara(pagina: number): any {
    return pagina <= 1 ? { page: null } : { page: pagina };
  }

  get totalPaginasTemas(): number[] {
    const total = this.paginationTemas?.totalPages || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  loadMiembros(): void {
    this.comunidadesService.getMiembros(this.comunidad.id, { page: 1, pageCount: 12 })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => (this.miembros = r?.data ?? []));
  }

  loadTopTemas(): void {
    this.comunidadesService.getTopTemas(this.comunidad.id, this.periodoTop)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => (this.topTemas = r ?? []));
  }

  loadComentariosRecientes(): void {
    this.comunidadesService.getComentariosRecientes(this.comunidad.id, 5)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => (this.comentariosRecientes = r ?? []));
  }

  cambiarPeriodoTop(periodo: string): void {
    this.periodoTop = periodo;
    this.loadTopTemas();
  }

  get esStaff(): boolean {
    return this.comunidad?.creador === this.currentUser?.usuario?.userName
      || this.currentUser?.usuario?.rango === 'Administrador'
      || this.currentUser?.usuario?.rango === 'Moderador';
  }

  get logueado(): boolean {
    return !!this.currentUser?.usuario;
  }

  unirme(): void {
    this.comunidadesService.unirme(this.comunidad.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.comunidad.soyMiembro = true;
      this.comunidad.miembrosCount++;
      this.notificationService.success('Te has unido a la comunidad', 'Bienvenido');
      this.loadMiembros();
    });
  }

  abandonar(): void {
    if (!this.notificationService.confirm('¿Abandonar esta comunidad?')) return;
    this.comunidadesService.abandonar(this.comunidad.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.comunidad.soyMiembro = false;
      this.comunidad.miembrosCount = Math.max(0, this.comunidad.miembrosCount - 1);
      this.notificationService.success('Has abandonado la comunidad', 'Listo');
      this.loadMiembros();
    });
  }

  seguir(): void {
    this.comunidadesService.seguir(this.comunidad.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((sigue: boolean) => {
      this.comunidad.laSigo = sigue;
      this.comunidad.seguidoresCount += sigue ? 1 : -1;
    });
  }

  get esCreadorOAdmin(): boolean {
    return this.comunidad?.creador === this.currentUser?.usuario?.userName
      || this.currentUser?.usuario?.rango === 'Administrador';
  }

  eliminarComunidad(): void {
    if (!this.notificationService.confirm(`¿Eliminar la comunidad "${this.comunidad.nombre}"? Esta acción no se puede deshacer.`)) return;
    this.comunidadesService.deleteComunidad(this.comunidad.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.notificationService.success('Comunidad eliminada', 'Listo');
      this.router.navigate(['/comunidades']);
    });
  }
}

import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Pagination } from 'src/app/models/api/api-response.model';
import { ComentarioReciente, ComunidadDetalle, ComunidadMiembro, TemaListado, TemaTop } from 'src/app/models/comunidades/comunidad.model';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { FormsModule } from '@angular/forms';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { ThumbPipe } from '../../../shared/pipes/thumb.pipe';

@Component({
    selector: 'app-comunidad-view',
    templateUrl: './comunidad-view.component.html',
    styleUrls: ['./comunidad-view.component.scss'],
    imports: [ThumbPipe, 
        RouterLink,
        FormsModule,
        UserPopoverDirective,
        UserAvatarComponent,
        TimeAgoPipe,
    ],
})
export class ComunidadViewComponent implements OnInit {
  private readonly documento = inject(DOCUMENT);
  private displayService = inject(DisplayComponentService);
  private comunidadesService = inject(IHttpComunidadesService);
  private securityService = inject(IHttpSecurityService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private seoService = inject(SEOService);

  private readonly destroyRef = inject(DestroyRef);

  public comunidad: ComunidadDetalle | null = null;
  public temas: TemaListado[] = [];
  public miembros: ComunidadMiembro[] = [];
  public topTemas: TemaTop[] = [];
  public comentariosRecientes: ComentarioReciente[] = [];
  public periodoTop: string = 'Semana';
  public currentUser?: JwtUserModel;
  public loading: boolean = true;
  public verMas: boolean = false;
  public slug: string = '';
  public queryTemas: string = '';
  public pageTemas: number = 1;
  public paginationTemas: Partial<Pagination> = {};

  constructor() {
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
      next: (comunidad) => {
        this.comunidad = comunidad;
        this.loading = false;
        this.seoService.setSEO({
          title: comunidad.nombre,
          description: comunidad.descripcion || `Comunidad ${comunidad.nombre} en Taringa. Únete, participa en sus temas y comparte con la comunidad.`,
          type: 'website',
          imageURL: comunidad.imagen || '',
          tags: [comunidad.nombre, 'comunidad', 'taringas'],
          canonical: `${environment.publicUrl}${this.documento.location.pathname}`,
          jsonLd: {
            '@context': 'https://schema.org',
            '@graph': [{
              '@type': 'CollectionPage',
              name: comunidad.nombre,
              description: comunidad.descripcion || undefined,
              url: `${environment.publicUrl}${this.documento.location.pathname}`,
              image: comunidad.imagen || undefined,
              isPartOf: { '@id': `${environment.publicUrl}/#website` },
              dateCreated: comunidad.fechaRegistro,
            }, {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Taringa!', item: `${environment.publicUrl}/` },
                { '@type': 'ListItem', position: 2, name: 'Comunidades', item: `${environment.publicUrl}/comunidades` },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: comunidad.nombre,
                  item: `${environment.publicUrl}${this.documento.location.pathname}`,
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
    const comunidad = this.comunidad;
    if (!comunidad) return;
    this.comunidadesService.getTemas(comunidad.id, { page: this.pageTemas, pageCount: 20, query: this.queryTemas })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => {
        this.temas = r?.data ?? [];
        this.paginationTemas = r?.pagination ?? {};
      });
  }

  buscarTemas(): void {
    this.pageTemas = 1;
    this.loadTemas();
  }

  queryParamsPara(pagina: number): Params {
    return pagina <= 1 ? { page: null } : { page: pagina };
  }

  get totalPaginasTemas(): number[] {
    const total = this.paginationTemas?.totalPages || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  loadMiembros(): void {
    const comunidad = this.comunidad;
    if (!comunidad) return;
    this.comunidadesService.getMiembros(comunidad.id, { page: 1, pageCount: 12 })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => (this.miembros = r?.data ?? []));
  }

  loadTopTemas(): void {
    const comunidad = this.comunidad;
    if (!comunidad) return;
    this.comunidadesService.getTopTemas(comunidad.id, this.periodoTop)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => (this.topTemas = r ?? []));
  }

  loadComentariosRecientes(): void {
    const comunidad = this.comunidad;
    if (!comunidad) return;
    this.comunidadesService.getComentariosRecientes(comunidad.id, 5)
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
    const comunidad = this.comunidad;
    if (!comunidad) return;
    this.comunidadesService.unirme(comunidad.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      comunidad.soyMiembro = true;
      comunidad.miembrosCount++;
      this.notificationService.success('Te has unido a la comunidad', 'Bienvenido');
      this.loadMiembros();
    });
  }

  abandonar(): void {
    const comunidad = this.comunidad;
    if (!comunidad) return;
    if (!this.notificationService.confirm('¿Abandonar esta comunidad?')) return;
    this.comunidadesService.abandonar(comunidad.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      comunidad.soyMiembro = false;
      comunidad.miembrosCount = Math.max(0, comunidad.miembrosCount - 1);
      this.notificationService.success('Has abandonado la comunidad', 'Listo');
      this.loadMiembros();
    });
  }

  seguir(): void {
    const comunidad = this.comunidad;
    if (!comunidad) return;
    this.comunidadesService.seguir(comunidad.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((sigue: boolean) => {
      comunidad.laSigo = sigue;
      comunidad.seguidoresCount += sigue ? 1 : -1;
    });
  }

  get esCreadorOAdmin(): boolean {
    return this.comunidad?.creador === this.currentUser?.usuario?.userName
      || this.currentUser?.usuario?.rango === 'Administrador';
  }

  eliminarComunidad(): void {
    const comunidad = this.comunidad;
    if (!comunidad) return;
    if (!this.notificationService.confirm(`¿Eliminar la comunidad "${comunidad.nombre}"? Esta acción no se puede deshacer.`)) return;
    this.comunidadesService.deleteComunidad(comunidad.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.notificationService.success('Comunidad eliminada', 'Listo');
      this.router.navigate(['/comunidades']);
    });
  }
}

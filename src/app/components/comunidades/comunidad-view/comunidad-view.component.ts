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
  }

  loadComunidad(): void {
    this.loading = true;
    this.comunidadesService.getComunidad(this.slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: any) => {
        this.comunidad = value;
        this.loading = false;
        this.seoService.setSEO({
          title: this.comunidad.nombre,
          description: this.comunidad.descripcion || `Comunidad ${this.comunidad.nombre} en Taringas. Únete, participa en sus temas y comparte con la comunidad.`,
          type: 'website',
          imageURL: this.comunidad.imagen || this.comunidad.avatar || '',
          tags: [this.comunidad.nombre, 'comunidad', 'taringas'],
        });
        this.loadTemas();
        this.loadMiembros();
        this.loadTopTemas();
        this.loadComentariosRecientes();
      },
      error: () => { this.loading = false; this.router.navigate(['/comunidades']); },
    });
  }

  loadTemas(): void {
    this.comunidadesService.getTemas(this.comunidad.id, { page: 1, pageCount: 20, query: this.queryTemas })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r: any) => (this.temas = r?.data ?? []));
  }

  buscarTemas(): void {
    this.loadTemas();
  }

  loadMiembros(): void {
    this.comunidadesService.getMiembros(this.comunidad.id, { page: 1, pageCount: 12 })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r: any) => (this.miembros = r?.data ?? []));
  }

  loadTopTemas(): void {
    this.comunidadesService.getTopTemas(this.comunidad.id, this.periodoTop)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r: any) => (this.topTemas = r ?? []));
  }

  loadComentariosRecientes(): void {
    this.comunidadesService.getComentariosRecientes(this.comunidad.id, 5)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r: any) => (this.comentariosRecientes = r ?? []));
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

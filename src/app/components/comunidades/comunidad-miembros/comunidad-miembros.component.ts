import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-comunidad-miembros',
  templateUrl: './comunidad-miembros.component.html',
  styleUrls: ['./comunidad-miembros.component.scss'],
})
export class ComunidadMiembrosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public comunidad: any = null;
  public miembros: any[] = [];
  public pagination: any = {};
  public loading: boolean = true;
  public slug: string = '';
  public currentUser: any;
  public gestionandoId: number | null = null;
  private page: number = 1;

  constructor(
    private displayService: DisplayComponentService,
    private comunidadesService: IHttpComunidadesService,
    private securityService: IHttpSecurityService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.slug = params['slug'];
      this.comunidadesService.getComunidad(this.slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (c: any) => { this.comunidad = c; this.loadMiembros(); },
        error: () => this.router.navigate(['/comunidades']),
      });
    });
  }

  get puedeGestionar(): boolean {
    return this.comunidad?.creador === this.currentUser?.usuario?.userName
      || this.currentUser?.usuario?.rango === 'Administrador'
      || this.currentUser?.usuario?.rango === 'Moderador';
  }

  esCreador(m: any): boolean {
    return m?.userName === this.comunidad?.creador;
  }

  toggleGestion(m: any): void {
    this.gestionandoId = this.gestionandoId === m.id ? null : m.id;
  }

  cambiarRango(m: any, permiso: number, esStaff: boolean): void {
    this.comunidadesService.cambiarRangoMiembro(this.comunidad.id, m.usuarioId, permiso, esStaff)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          m.permiso = permiso;
          m.esStaff = esStaff;
          this.gestionandoId = null;
          this.notificationService.success('Rango del miembro actualizado', 'Listo');
        },
      });
  }

  loadMiembros(): void {
    this.loading = true;
    this.comunidadesService.getMiembros(this.comunidad.id, { page: this.page, pageCount: 24 })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (r: any) => {
          this.miembros = r?.data ?? [];
          this.pagination = r?.pagination ?? {};
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  rangoNombre(permiso: number): string {
    return permiso === 3 ? 'Posteador' : permiso === 2 ? 'Comentador' : 'Visitante';
  }

  goToPage(page: number): void {
    this.page = page;
    this.loadMiembros();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number[] {
    const total = this.pagination?.totalPages || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}

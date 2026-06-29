import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpDenunciasService } from 'src/app/services/interfaces/httpDenuncias.interface';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';

@Component({
  standalone: false,
  selector: 'app-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public currentURL = '';

  // Pendientes "por ver" para los badges del sidebar
  public denunciasPosts = 0;
  public denunciasComunidad = 0;
  public denunciasShouts = 0;
  public denunciasReportes = 0;
  public contactosPendientes = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postsService: IHttpPostsService,
    private comunidadesService: IHttpComunidadesService,
    private perfilService: IHttpPerfilService,
    private denunciasService: IHttpDenunciasService,
    private generalService: IHttpGeneralService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.url.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      this.currentURL = value[0]?.path;
    });

    this.cargarContadores();
  }

  private cargarContadores(): void {
    // Solo necesitamos el contador "pendientes" (pageCount=1 para payload mínimo)
    this.postsService.getDenunciasComentarios(1, 1, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r: any) => (this.denunciasPosts = r?.pendientes ?? 0),
      error: () => {},
    });

    this.comunidadesService.getDenunciasComentarios(1, 1, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r: any) => (this.denunciasComunidad = r?.pendientes ?? 0),
      error: () => {},
    });

    this.perfilService.getDenunciasShoutComentarios(1, 1, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r: any) => (this.denunciasShouts = r?.pendientes ?? 0),
      error: () => {},
    });

    this.denunciasService.getDenunciasCount().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r: any) => (this.denunciasReportes = r ?? 0),
      error: () => {},
    });

    this.generalService.getContactosPendientes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r: any) => (this.contactosPendientes = r ?? 0),
      error: () => {},
    });
  }
}

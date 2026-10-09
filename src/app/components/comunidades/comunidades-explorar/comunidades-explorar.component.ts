import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Pagination } from 'src/app/models/api/api-response.model';
import { ComunidadCard, ComunidadCategoria } from 'src/app/models/comunidades/comunidad.model';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { FormsModule } from '@angular/forms';
import { ThumbPipe } from '../../../shared/pipes/thumb.pipe';

@Component({
    selector: 'app-comunidades-explorar',
    templateUrl: './comunidades-explorar.component.html',
    styleUrls: ['../comunidades-index/comunidades-index.component.scss'],
    imports: [ThumbPipe, FormsModule, RouterLink],
})
export class ComunidadesExplorarComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private comunidadesService = inject(IHttpComunidadesService);
  private securityService = inject(IHttpSecurityService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SEOService);

  private readonly destroyRef = inject(DestroyRef);

  public comunidades: ComunidadCard[] = [];
  public categorias: ComunidadCategoria[] = [];
  public pagination: Partial<Pagination> = {};
  public currentUser?: JwtUserModel;
  public loading: boolean = false;

  public categoriaId: number = 0;
  public query: string = '';
  private page: number = 1;
  private pageCount: number = 12;

  constructor() {
    this.seoService.setSEO({
      title: 'Explorar comunidades',
      description:
        'Todas las comunidades de Taringa: buscá por categoría o por nombre y sumate a las que te interesen.',
      type: 'website',
      imageURL: '',
      tags: ['comunidades', 'explorar', 'taringa'],
    });

    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.loadCategorias();

    // La pagina vive en ?page= para que sea enlazable y rastreable.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.page = Number(params.get('page')) || 1;
        this.loadComunidades();
      });
  }

  loadCategorias(): void {
    this.comunidadesService.getCategorias().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.categorias = value ?? [];
    });
  }

  loadComunidades(): void {
    this.loading = true;
    const search = { page: this.page, pageCount: this.pageCount, query: this.query, categoriaId: this.categoriaId };
    this.comunidadesService.getComunidades(search).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.comunidades = response?.data ?? [];
        this.pagination = response?.pagination ?? {};
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  filtrarCategoria(id: number): void {
    this.categoriaId = id;
    this.page = 1;
    this.loadComunidades();
  }

  buscar(): void {
    this.page = 1;
    this.loadComunidades();
  }

  queryParamsPara(pagina: number): Params {
    return pagina <= 1 ? { page: null } : { page: pagina };
  }

  goToPage(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.queryParamsPara(page),
      queryParamsHandling: 'merge',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number[] {
    const total = this.pagination?.totalPages || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}

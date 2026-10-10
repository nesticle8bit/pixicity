import { CargandoComponent } from '../../shared/cargando/cargando.component';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { NgClass } from '@angular/common';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { ThumbPipe } from '../../../shared/pipes/thumb.pipe';

@Component({
    selector: 'app-fotos-index',
    templateUrl: './fotos-index.component.html',
    styleUrls: ['./fotos-index.component.scss'],
    imports: [CargandoComponent, ThumbPipe, 
        RouterLink,
        UserPopoverDirective,
        UserAvatarComponent,
        NgClass,
        TimeAgoPipe,
    ],
})
export class FotosIndexComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private securityService = inject(IHttpSecurityService);
  private fotosService = inject(IHttpFotosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SEOService);

  private readonly destroyRef = inject(DestroyRef);

  public fotos: any[] = [];
  public pagination: any = {};
  public currentUser?: JwtUserModel;
  public loading: boolean = false;
  public userName: string = '';

  private page: number = 1;
  private pageCount: number = 12;

  constructor() {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.userName = params['userName'] || '';
      this.page = 1;
      this.seoService.setSEO(
        this.userName
          ? {
              title: `Fotos de ${this.userName}`,
              description: `Galería de fotos de ${this.userName} en Taringa.`,
              type: 'website',
              imageURL: '',
              tags: [this.userName, 'fotos', 'galería', 'taringas'],
            }
          : {
              title: 'Fotos',
              description: 'Explora las fotos compartidas por la comunidad de Taringa.',
              type: 'website',
              imageURL: '',
              tags: ['fotos', 'galería', 'imágenes', 'taringas'],
            }
      );
      this.loadFotos();
    });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const page = Number(params.get('page')) || 1;
        if (page !== this.page) {
          this.page = page;
          this.loadFotos();
        }
      });
  }

  loadFotos(): void {
    this.loading = true;
    const search = { page: this.page, pageCount: this.pageCount };

    const obs = this.userName
      ? this.fotosService.getFotosByUsuario(this.userName, search)
      : this.fotosService.getFotos(search);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.fotos = response?.data || [];
        this.pagination = response?.pagination || {};
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  goToPage(page: number): void {
    // Navegar en vez de recargar en memoria: la pagina queda en la URL y
    // Googlebot puede seguir los enlaces al resto de la galeria.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.queryParamsPara(page),
      queryParamsHandling: 'merge',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  queryParamsPara(pagina: number): any {
    return pagina <= 1 ? { page: null } : { page: pagina };
  }

  get totalPages(): number[] {
    const total = this.pagination?.totalPages || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}

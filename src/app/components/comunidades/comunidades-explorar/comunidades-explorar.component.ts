import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  standalone: false,
  selector: 'app-comunidades-explorar',
  templateUrl: './comunidades-explorar.component.html',
  styleUrls: ['../comunidades-index/comunidades-index.component.scss'],
})
export class ComunidadesExplorarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public comunidades: any[] = [];
  public categorias: any[] = [];
  public pagination: any = {};
  public currentUser: any;
  public loading: boolean = false;

  public categoriaId: number = 0;
  public query: string = '';
  private page: number = 1;
  private pageCount: number = 12;

  constructor(
    private displayService: DisplayComponentService,
    private comunidadesService: IHttpComunidadesService,
    private securityService: IHttpSecurityService
  ) {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.loadCategorias();
    this.loadComunidades();
  }

  loadCategorias(): void {
    this.comunidadesService.getCategorias().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      this.categorias = value ?? [];
    });
  }

  loadComunidades(): void {
    this.loading = true;
    const search = { page: this.page, pageCount: this.pageCount, query: this.query, categoriaId: this.categoriaId };
    this.comunidadesService.getComunidades(search).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
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

  goToPage(page: number): void {
    this.page = page;
    this.loadComunidades();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number[] {
    const total = this.pagination?.totalPages || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}

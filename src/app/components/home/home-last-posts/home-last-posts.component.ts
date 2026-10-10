import { Subscription } from 'rxjs';
import { ViewportScroller, NgClass } from '@angular/common';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { CategoriesSelectorComponent } from '../../sections/categories-selector/categories-selector.component';
import { MatTooltip } from '@angular/material/tooltip';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-home-last-posts',
    templateUrl: './home-last-posts.component.html',
    styleUrls: ['./home-last-posts.component.scss'],
    imports: [
        CategoriesSelectorComponent,
        MatTooltip,
        RouterLink,
        UserAvatarComponent,
        UserPopoverDirective,
        NgClass,
        MatPaginator,
        TimeAgoPipe,
        TruncatePipe,
    ],
})
export class HomeLastPostsComponent implements OnInit {
  paginationService = inject(PaginationService);
  private postService = inject(IHttpPostsService);
  private viewPort = inject(ViewportScroller);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);
  private cargaGetPosts?: Subscription;

  private _categoria: string = '';

  @Input() set categoria(value: string) {
    this._categoria = value;
    this.load();
  }

  get categoria(): string {
    return this._categoria;
  }

  public stickyPosts: any = [];
  public lastPosts: any = [];
  public totalCount: number = 0;
  public pageIndex: number = 0;

  /** Evita la doble carga cuando llegan a la vez la categoria y el ?page=. */
  private ultimaCarga: string = '';
  // El input `categoria` llega antes de ngOnInit: si cargaba ahí pedía la página 1 y enseguida la del ?page=,
  // y la respuesta que llegara última (a veces la página 1) quedaba en pantalla.
  private iniciado = false;

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 42, length: 0 });
  }

  ngOnInit(): void {
    this.iniciado = true;
    this.getStickyPosts();

    // La pagina vive en la URL (?page=N): asi Googlebot puede rastrear el
    // listado completo siguiendo enlaces reales, no solo la primera pagina.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const page = Number(params.get('page')) || 1;
        this.pageIndex = Math.max(0, page - 1);
        this.load();
      });
  }

  get totalPaginas(): number {
    return Math.ceil(
      this.totalCount / (this.paginationService.pageCount || 10),
    );
  }

  /** Ventana de paginas alrededor de la actual, para no escupir 500 enlaces. */
  get paginasVisibles(): number[] {
    const total = this.totalPaginas;
    const actual = this.pageIndex + 1;
    const desde = Math.max(1, actual - 2);
    const hasta = Math.min(total, desde + 4);

    return Array.from(
      { length: Math.max(0, hasta - desde + 1) },
      (_, i) => desde + i,
    );
  }

  queryParamsPara(pagina: number): any {
    return pagina <= 1 ? { page: null } : { page: pagina };
  }

  private load(): void {
    if (!this.iniciado) {
      return;
    }
    const clave = `${this._categoria}|${this.pageIndex}`;
    if (clave === this.ultimaCarga) {
      return;
    }

    this.ultimaCarga = clave;
    this.paginationService.change({
      pageIndex: this.pageIndex,
      pageSize: this.paginationService.pageCount,
      length: this.totalCount,
    });
    this.getPosts(this._categoria);
  }

  getPosts(categoria: string): void {
    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetPosts?.unsubscribe();

    this.cargaGetPosts = this.postService
      .getPosts(categoria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.lastPosts = response.data;
        this.totalCount = response.pagination.totalCount;
      });
  }

  getStickyPosts(): void {
    this.postService
      .getStickyPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((posts) => {
        this.stickyPosts = posts;
      });
  }

  pageChange(event: PageEvent): void {
    // Navegar en vez de cargar: la suscripcion a queryParams hace el fetch y
    // la URL queda compartible / rastreable.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.queryParamsPara(event.pageIndex + 1),
      queryParamsHandling: 'merge',
    });

    this.viewPort.scrollToPosition([0, 0]);
  }
}

import { Subscription } from 'rxjs';
import { ViewportScroller } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { TemaReciente } from 'src/app/models/comunidades/comunidad.model';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { CategoriesSelectorComponent } from '../../../sections/categories-selector/categories-selector.component';
import { UserPopoverDirective } from '../../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';
import { TimeAgoPipe } from '../../../../shared/pipes/timeAgo.pipe';
import { ICONO_CATEGORIA_POR_DEFECTO } from 'src/app/shared/helpers/iconos-categorias';

/** Temas recientes de /comunidades con el mismo formato que los posts recientes del home. */
@Component({
    selector: 'app-comunidades-temas-recientes',
    templateUrl: './comunidades-temas-recientes.component.html',
    styleUrls: ['./comunidades-temas-recientes.component.scss'],
    imports: [
        CategoriesSelectorComponent,
        MatTooltip,
        RouterLink,
        UserPopoverDirective,
        UserAvatarComponent,
        MatPaginator,
        TimeAgoPipe,
    ],
})
export class ComunidadesTemasRecientesComponent implements OnInit {
  private comunidadesService = inject(IHttpComunidadesService);
  private viewPort = inject(ViewportScroller);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);
  private carga?: Subscription;

  public readonly iconoPorDefecto = ICONO_CATEGORIA_POR_DEFECTO;
  public readonly pageSize = 30;
  public readonly filasEsqueleto = Array.from({ length: this.pageSize });

  public temas: TemaReciente[] = [];
  public totalCount: number = 0;
  public pageIndex: number = 0;
  /** SEO de la categoría de comunidad elegida en el selector (?categoria=). */
  public categoria: string = '';
  public cargado = false;

  ngOnInit(): void {
    // Página y categoría viven en la URL: enlaces compartibles y rastreables.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const categoria = params.get('categoria') ?? '';
        const pageIndex = Math.max(0, (Number(params.get('page')) || 1) - 1);
        if (this.cargado && categoria === this.categoria && pageIndex === this.pageIndex) {
          return;
        }

        this.categoria = categoria;
        this.pageIndex = pageIndex;
        this.cargar();
      });
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  /** Ventana de páginas alrededor de la actual. */
  get paginasVisibles(): number[] {
    const total = this.totalPaginas;
    const actual = this.pageIndex + 1;
    const desde = Math.max(1, actual - 2);
    const hasta = Math.min(total, desde + 4);

    return Array.from({ length: Math.max(0, hasta - desde + 1) }, (_, i) => desde + i);
  }

  queryParamsPara(pagina: number): Params {
    return pagina <= 1 ? { page: null } : { page: pagina };
  }

  /** El título completo como tooltip nativo solo cuando el CSS lo cortó con "…". */
  tituloSiCortado(event: MouseEvent, titulo: string): void {
    const el = event.target as HTMLElement;
    el.title = el.scrollWidth > el.clientWidth ? titulo : '';
  }

  pageChange(event: PageEvent): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.queryParamsPara(event.pageIndex + 1),
      queryParamsHandling: 'merge',
    });

    this.viewPort.scrollToPosition([0, 0]);
  }

  private cargar(): void {
    // Cancela la carga anterior: una respuesta vieja no pisa a la nueva.
    this.carga?.unsubscribe();

    this.carga = this.comunidadesService
      .getTemasRecientes(this.pageIndex + 1, this.pageSize, this.categoria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (v) => {
          this.temas = v?.data ?? [];
          this.totalCount = v?.pagination?.totalCount ?? 0;
          this.cargado = true;
        },
        error: () => (this.cargado = true),
      });
  }
}

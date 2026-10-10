import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { PostUrlLinkComponent } from '../../../../addons/post-url-link/post-url-link.component';
import { UserAvatarComponent } from '../../../../addons/user-avatar/user-avatar.component';
import { UserPopoverDirective } from '../../../../../shared/directives/userPopover.directive';
import { MatMenuTrigger, MatMenu } from '@angular/material/menu';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-table-votos',
    templateUrl: './table-votos.component.html',
    styleUrls: ['./table-votos.component.scss'],
    imports: [
        AdminFiltrosComponent,
        NgClass,
        MatTooltip,
        PostUrlLinkComponent,
        UserAvatarComponent,
        UserPopoverDirective,
        MatMenuTrigger,
        MatMenu,
        MatPaginator,
        TimeAgoPipe,
    ],
})
export class TableVotosComponent implements OnInit {
  paginationService = inject(PaginationService);
  private postService = inject(IHttpPostsService);

  private readonly destroyRef = inject(DestroyRef);

  public votos: any[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar por votante o post...',
    fechas: true,
    orden: true,
    usuario: 'Votante',
    tipos: [
      { valor: 'positivos', label: 'Positivos' },
      { valor: 'negativos', label: 'Negativos' },
    ],
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getVotos();
  }

  getVotos(): void {
    this.cargando = true;
    this.postService.getVotos(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.votos = response.data ?? [];
      this.totalCount = response.pagination.totalCount;
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getVotos();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getVotos();
  }
}

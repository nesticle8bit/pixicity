import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  standalone: false,
  selector: 'app-table-votos',
  templateUrl: './table-votos.component.html',
  styleUrls: ['./table-votos.component.scss'],
})
export class TableVotosComponent implements OnInit {
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

  constructor(
    public paginationService: PaginationService,
    private postService: IHttpPostsService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getVotos();
  }

  getVotos(): void {
    this.cargando = true;
    this.postService.getVotos(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.votos = response.data;
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

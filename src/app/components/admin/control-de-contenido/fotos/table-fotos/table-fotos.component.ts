import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WhoIsIpComponent } from '../../../../addons/who-is-ip/who-is-ip.component';
import { UserPopoverDirective } from '../../../../../shared/directives/userPopover.directive';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';
import { ThumbPipe } from '../../../../../shared/pipes/thumb.pipe';

@Component({
    selector: 'app-table-fotos',
    templateUrl: './table-fotos.component.html',
    styleUrls: ['./table-fotos.component.scss'],
    imports: [ThumbPipe, 
        AdminFiltrosComponent,
        NgClass,
        RouterLink,
        WhoIsIpComponent,
        UserPopoverDirective,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatPaginator,
        TimeAgoPipe,
    ],
})
export class TableFotosComponent implements OnInit {
  paginationService = inject(PaginationService);
  private fotosService = inject(IHttpFotosService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public fotos: any[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar fotos o autores...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Autor',
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getFotos();
  }

  getFotos(): void {
    this.cargando = true;
    this.fotosService
      .getFotosAdmin({ page: this.paginationService.page, pageCount: this.paginationService.pageCount }, this.filtro)
      .pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.fotos = response.data ?? [];
        this.totalCount = response.pagination.totalCount;
      });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getFotos();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getFotos();
  }

  eliminarFoto(fotoId: number, index: number): void {
    if (this.notificationService.confirm('¿Seguro que deseas borrar esta foto?')) {
      this.fotosService
        .deleteFoto(fotoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response: boolean) => {
          if (response) {
            this.notificationService.success('La foto ha sido eliminada correctamente, ahora nadie la podrá visualizar', 'Eliminada');
            this.fotos[index].eliminado = true;
          }
        });
    }
  }
}

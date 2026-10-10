import { ShoutAdmin } from 'src/app/models/perfil/shout-vm.model';
import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { NgClass } from '@angular/common';
import { UserAvatarComponent } from '../../../../addons/user-avatar/user-avatar.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-table-shouts',
    templateUrl: './table-shouts.component.html',
    styleUrls: ['./table-shouts.component.scss'],
    imports: [
        AdminFiltrosComponent,
        NgClass,
        UserAvatarComponent,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatPaginator,
        TimeAgoPipe,
        TruncatePipe,
    ],
})
export class TableShoutsComponent implements OnInit {
  paginationService = inject(PaginationService);
  private perfilService = inject(IHttpPerfilService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public shouts: ShoutAdmin[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar en shouts o autores...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Autor',
    tipos: [
      { valor: 'Texto', label: 'Texto' },
      { valor: 'Foto', label: 'Foto' },
      { valor: 'Video', label: 'Video' },
      { valor: 'Enlace', label: 'Enlace' },
      { valor: 'Spotify', label: 'Spotify' },
    ],
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getShouts();
  }

  getShouts(): void {
    this.cargando = true;
    this.perfilService.getShoutsAdmin(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.shouts = response.shouts ?? [];
      this.totalCount = response.pagination.totalCount;
    });
  }

  deleteShout(id: number, index: number): void {
    this.perfilService.deleteShout(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('El shout ha sido eliminado exitosamente', 'Eliminado');

        if (this.shouts[index]) {
          this.shouts[index].eliminado = true;
        }
      }
    });
  }

  recoveryShout(id: number, index: number): void {
    this.perfilService.recoveryShout(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('El shout ha sido recuperado exitosamente', 'Recuperado');

        if (this.shouts[index]) {
          this.shouts[index].eliminado = false;
        }
      }
    });
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getShouts();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getShouts();
  }
}

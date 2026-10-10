import { PaginaAdmin } from 'src/app/models/admin/filas-admin.model';
import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogCreateUpdatePaginasComponent } from '../dialog-create-update-paginas/dialog-create-update-paginas.component';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { UserAvatarComponent } from '../../../../addons/user-avatar/user-avatar.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-table-paginas',
    templateUrl: './table-paginas.component.html',
    styleUrls: ['./table-paginas.component.scss'],
    imports: [
        AdminFiltrosComponent,
        MatButton,
        MatIcon,
        NgClass,
        MatTooltip,
        UserAvatarComponent,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatPaginator,
        TimeAgoPipe,
    ],
})
export class TablePaginasComponent implements OnInit {
  paginationService = inject(PaginationService);
  private webService = inject(IHttpWebService);
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public paginas: PaginaAdmin[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar por título, slug o contenido...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Creada por',
  };
  public formGroup: FormGroup;

  constructor() {
    this.formGroup = this.formBuilder.group({
      search: '',
    });

    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getPaginas();
  }

  getPaginas(): void {
    this.cargando = true;
    this.webService
      .getPaginas(this.formGroup.value.search, this.filtro)
      .pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.paginas = response?.paginas;
        this.totalCount = response?.pagination?.totalCount;
      });
  }

  createUpdatePagina(pagina: PaginaAdmin | null = null): void {
    const dialogRef = this.dialog.open(DialogCreateUpdatePaginasComponent, {
      width: '1080px',
      data: pagina,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.getPaginas();
      }
    });
  }

  deletePagina(pagina: PaginaAdmin): void {
    const accion = pagina.eliminado ? 'recuperar' : 'eliminar';
    if (this.notificationService.confirm(`¿Está seguro de ${accion} esta página?`)) {
      this.webService.deletePagina(pagina.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.notificationService.success(
            `La página ha sido ${pagina.eliminado ? 'recuperada' : 'eliminada'} correctamente`,
            pagina.eliminado ? 'Recuperada' : 'Eliminada'
          );
          pagina.eliminado = !pagina.eliminado;
        }
      });
    }
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getPaginas();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPaginas();
  }
}

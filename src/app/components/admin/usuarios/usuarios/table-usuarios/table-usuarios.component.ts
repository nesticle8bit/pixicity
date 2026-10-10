import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { DialogEnviarMPComponent } from 'src/app/components/dialogs/dialog-enviar-mp/dialog-enviar-mp.component';
import { DialogBanUserComponent } from 'src/app/components/dialogs/dialog-ban-user/dialog-ban-user.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { UsuarioAdminSearchFilter } from 'src/app/models/shared/service-types.model';
import { UsuarioAdminViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass, DatePipe } from '@angular/common';
import { UserAvatarComponent } from '../../../../addons/user-avatar/user-avatar.component';
import { UserPopoverDirective } from '../../../../../shared/directives/userPopover.directive';
import { CountryFlagComponent } from '../../../../addons/country-flag/country-flag.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-table-usuarios',
    templateUrl: './table-usuarios.component.html',
    styleUrls: ['./table-usuarios.component.scss'],
    imports: [
        AdminFiltrosComponent,
        MatTooltip,
        NgClass,
        UserAvatarComponent,
        UserPopoverDirective,
        CountryFlagComponent,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        MatDivider,
        MatPaginator,
        DatePipe,
        TimeAgoPipe,
    ],
})
export class TableUsuariosComponent implements OnInit {
  paginationService = inject(PaginationService);
  private securityService = inject(IHttpSecurityService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  readonly searchParameters = input<UsuarioAdminSearchFilter>();

  public usuarios: UsuarioAdminViewModel[] = [];
  public totalCount: number = 0;

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar por usuario, email o IP...',
    fechas: true,
    estado: true,
    orden: true,
    tipoLabel: 'Baneo',
    tipos: [
      { valor: 'baneados', label: 'Baneados' },
      { valor: 'sin-banear', label: 'Sin banear' },
    ],
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getUsuarios();
  }

  getUsuarios(): void {
    this.cargando = true;
    const parameters: UsuarioAdminSearchFilter = {};

    const searchParameters = this.searchParameters();
    if(searchParameters?.rangoId) {
      parameters.rangoId = searchParameters?.rangoId;
    }

    this.securityService.getUsuariosAdmin(parameters, this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.usuarios = response.usuarios ?? [];
      this.totalCount = response.pagination.totalCount;
    });
  }

  banUser(user: UsuarioAdminViewModel): void {
    const dialogRef = this.dialog.open(DialogBanUserComponent, {
      width: '860px',
      data: user.id,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.getUsuarios();
      }
    });
  }

  deleteUser(usuario: UsuarioAdminViewModel): void {
    const accion = usuario.eliminado ? 'recuperar' : 'eliminar';
    if (this.notificationService.confirm(`¿Está seguro de ${accion} el usuario?`)) {
      this.securityService.removeUsuario(usuario.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.notificationService.success(
            `El usuario ha sido ${usuario.eliminado ? 'recuperado' : 'eliminado'} correctamente`,
            usuario.eliminado ? 'Recuperado' : 'Eliminado'
          );
          this.getUsuarios();
        }
      });
    }
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getUsuarios();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getUsuarios();
  }

  async changeAvatar(usuario: UsuarioAdminViewModel): Promise<void> {
    const { DialogChangeAvatarComponent } = await import(
      'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component'
    );

    this.dialog.open(DialogChangeAvatarComponent, {
      width: '350px',
      disableClose: true,
      data: {
        isAdmin: true,
        usuario,
      },
    });
  }

  removeAvatar(usuario: UsuarioAdminViewModel): void {
    if (this.notificationService.confirm('¿Está seguro de eliminar el avatar del usuario?')) {
      this.securityService.removeAvatar(usuario.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.notificationService.success('El avatar del usuario ha sido eliminado correctamente', 'Eliminado');
          this.getUsuarios();
        }
      });
    }
  }

  enviarMP(usuario: UsuarioAdminViewModel): void {
    this.dialog.open(DialogEnviarMPComponent, {
      width: '780px',
      disableClose: true,
      data: {
        userName: usuario.userName,
      },
    });
  }
}

import { DialogChangeAvatarComponent } from 'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component';
import { DialogEnviarMPComponent } from 'src/app/components/dialogs/dialog-enviar-mp/dialog-enviar-mp.component';
import { DialogBanUserComponent } from 'src/app/components/dialogs/dialog-ban-user/dialog-ban-user.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-usuarios',
  templateUrl: './table-usuarios.component.html',
  styleUrls: ['./table-usuarios.component.scss'],
})
export class TableUsuariosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input() searchParameters: any;

  public usuarios: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getUsuarios();
  }

  getUsuarios(): void {
    const parameters: any = {};

    if(this.searchParameters?.rangoId) {
      parameters.rangoId = this.searchParameters?.rangoId;
    }

    this.securityService.getUsuariosAdmin(parameters).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.usuarios = response.usuarios;
      this.totalCount = response.pagination.totalCount;
    });
  }

  banUser(user: any): void {
    const dialogRef = this.dialog.open(DialogBanUserComponent, {
      width: '860px',
      data: user.id,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      if (value) {
        this.getUsuarios();
      }
    });
  }

  deleteUser(usuario: any): void {
    const accion = usuario.eliminado ? 'recuperar' : 'eliminar';
    if (this.notificationService.confirm(`¿Está seguro de ${accion} el usuario?`)) {
      this.securityService.removeUsuario(usuario.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getUsuarios();
  }

  changeAvatar(usuario: any): void {
    this.dialog.open(DialogChangeAvatarComponent, {
      width: '350px',
      disableClose: true,
      data: {
        isAdmin: true,
        usuario,
      },
    });
  }

  removeAvatar(usuario: any): void {
    if (this.notificationService.confirm('¿Está seguro de eliminar el avatar del usuario?')) {
      this.securityService.removeAvatar(usuario.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('El avatar del usuario ha sido eliminado correctamente', 'Eliminado');
          this.getUsuarios();
        }
      });
    }
  }

  enviarMP(usuario: any): void {
    this.dialog.open(DialogEnviarMPComponent, {
      width: '780px',
      disableClose: true,
      data: {
        userName: usuario.userName,
      },
    });
  }
}

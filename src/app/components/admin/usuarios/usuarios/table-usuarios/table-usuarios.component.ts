import { DialogChangeAvatarComponent } from 'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component';
import { DialogEnviarMPComponent } from 'src/app/components/dialogs/dialog-enviar-mp/dialog-enviar-mp.component';
import { DialogBanUserComponent } from 'src/app/components/dialogs/dialog-ban-user/dialog-ban-user.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table-usuarios',
  templateUrl: './table-usuarios.component.html',
  styleUrls: ['./table-usuarios.component.scss'],
})
export class TableUsuariosComponent implements OnInit {
  @Input() searchParameters: any;

  public usuarios: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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

    this.securityService.getUsuariosAdmin(parameters).subscribe((response: any) => {
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

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value) {
        this.getUsuarios();
      }
    });
  }

  deleteUser(usuario: any): void {
    Swal.fire({
      title: 'Eliminar',
      text: `¿Está seguro de ${
        usuario.eliminado ? 'recuperar' : 'eliminar'
      } el usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `${usuario.eliminado ? 'Recuperar' : 'Eliminar'}`,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.securityService
          .removeUsuario(usuario.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: `${usuario.eliminado ? 'Recuperado' : 'Eliminado'}`,
                text: `El usuario ha sido ${
                  usuario.eliminado ? 'recuperado' : 'eliminado'
                } correctamente`,
                icon: 'success',
                timer: 3000,
              });

              this.getUsuarios();
            }
          });
      }
    });
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
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro de eliminar el avatar del usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.securityService
          .removeAvatar(usuario.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Eliminado',
                text: 'El avatar del usuario ha sido eliminado correctamente',
                icon: 'success',
                timer: 3000,
              });

              this.getUsuarios();
            }
          });
      }
    });
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

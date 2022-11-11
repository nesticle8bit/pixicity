import { DialogBanUserComponent } from 'src/app/components/dialogs/dialog-ban-user/dialog-ban-user.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { DialogChangeAvatarComponent } from 'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component';

@Component({
  selector: 'app-table-usuarios',
  templateUrl: './table-usuarios.component.html',
  styleUrls: ['./table-usuarios.component.scss'],
})
export class TableUsuariosComponent implements OnInit {
  public usuarios: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnInit(): void {
    this.getUsuarios();
  }

  getUsuarios(): void {
    this.securityService.getUsuariosAdmin().subscribe((response: any) => {
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

  deleteUser(id: number): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro de eliminar esta sesión del usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.securityService
          .deleteSessionById(id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Eliminado',
                text: 'La sesión ha sido eliminado correctamente',
                icon: 'success',
                timer: 3000,
              });
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
        usuario
      }
    });
  }
}

import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getSesiones();
  }

  getSesiones(): void {
    this.securityService.getUsuariosAdmin().subscribe((response: any) => {
      this.usuarios = response.usuarios;
      this.totalCount = response.pagination.totalCount;
    });
  }

  banUser(user: any): void {
    Swal.fire({
      title: 'Banear Usuario',
      text: `¿Está seguro de banear el usuario ${user.userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Banear',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.securityService
          .banUser(user.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Baneado',
                text: 'El usuario ha sido baneado correctamente',
                icon: 'success',
                timer: 3000,
              });
            }
          });
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
    this.getSesiones();
  }
}

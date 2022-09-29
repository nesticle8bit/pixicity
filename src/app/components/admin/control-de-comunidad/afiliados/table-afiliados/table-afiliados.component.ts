import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { DialogUpdateAfiliadosComponent } from '../dialog-update-afiliados/dialog-update-afiliados.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-table-afiliados',
  templateUrl: './table-afiliados.component.html',
  styleUrls: ['./table-afiliados.component.scss'],
})
export class TableAfiliadosComponent implements OnInit {
  public afiliados: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private generalService: IHttpGeneralService,
    private webService: IHttpWebService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnInit(): void {
    this.getAfiliados();
  }

  getAfiliados(): void {
    this.generalService.getAfiliados().subscribe((response: any) => {
      this.afiliados = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getAfiliados();
  }

  activarDesactivarAfiliado(afiliado: any): void {
    if (!afiliado) {
      return;
    }

    this.webService
      .changeAfiliadoActive({ id: afiliado.id, activo: afiliado.activo })
      .subscribe((response: any) => {
        if (response) {
          Swal.fire({
            title: afiliado.activo ? 'Desactivado' : 'Activado',
            text: afiliado.activo
              ? 'El afiliado ha sido deshabilitado en el inicio de la página'
              : 'El afiliado ha sido activado en el inicio de la página',
            icon: 'success',
            timer: 3000,
          });

          afiliado.activo = !afiliado.activo;
        }
      });
  }

  updateAfiliado(afiliado: any): void {
    const dialogRef = this.dialog.open(DialogUpdateAfiliadosComponent, {
      width: '980px',
      data: afiliado,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value) {
        afiliado.activo = value.activo;
        afiliado.banner = value.banner;
        afiliado.descripcion = value.descripcion;
        afiliado.titulo = value.titulo;
        afiliado.url = value.url;
      }
    });
  }

  clipboard(codigo: string): void {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = `https://pixicity.io/?ref=${codigo}`;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.snackBar.open('Texto copiado al portapapeles', '', {
      duration: 3 * 1000,
    });
  }

  deleteAfiliado(afiliado: any, index: number): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro de eliminar esta afiliación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.generalService
          .deleteAfiliado(afiliado.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Eliminado',
                text: 'La afiliación ha sido eliminada correctamente',
                icon: 'success',
                timer: 3000,
              });

              this.afiliados.splice(index, 1);
            }
          });
      }
    });
  }
}

import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogUpdateAfiliadosComponent } from '../dialog-update-afiliados/dialog-update-afiliados.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-table-afiliados',
  templateUrl: './table-afiliados.component.html',
  styleUrls: ['./table-afiliados.component.scss'],
})
export class TableAfiliadosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public afiliados: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private generalService: IHttpGeneralService,
    private webService: IHttpWebService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getAfiliados();
  }

  getAfiliados(): void {
    this.generalService.getAfiliados().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          this.notificationService.success(
            afiliado.activo
              ? 'El afiliado ha sido deshabilitado en el inicio de la página'
              : 'El afiliado ha sido activado en el inicio de la página',
            afiliado.activo ? 'Desactivado' : 'Activado'
          );

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

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
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
    selBox.value = `https://taringas.net/?ref=${codigo}`;
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
    if (this.notificationService.confirm('¿Está seguro de eliminar esta afiliación?')) {
      this.generalService.deleteAfiliado(afiliado.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('La afiliación ha sido eliminada correctamente', 'Eliminado');
          this.afiliados.splice(index, 1);
        }
      });
    }
  }
}

import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogCreateUpdatePaginasComponent } from '../dialog-create-update-paginas/dialog-create-update-paginas.component';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-paginas',
  templateUrl: './table-paginas.component.html',
  styleUrls: ['./table-paginas.component.scss'],
})
export class TablePaginasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public paginas: any[] = [];
  public totalCount: number = 0;
  public formGroup: FormGroup;

  constructor(
    public paginationService: PaginationService,
    private webService: IHttpWebService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.formBuilder.group({
      search: '',
    });

    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getPaginas();
  }

  getPaginas(): void {
    this.webService
      .getPaginas(this.formGroup.value.search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        this.paginas = response?.paginas;
        this.totalCount = response?.pagination?.totalCount;
      });
  }

  createUpdatePagina(pagina: any = null): void {
    const dialogRef = this.dialog.open(DialogCreateUpdatePaginasComponent, {
      width: '1080px',
      data: pagina,
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      if (value) {
        this.getPaginas();
      }
    });
  }

  deletePagina(pagina: any): void {
    const accion = pagina.eliminado ? 'recuperar' : 'eliminar';
    if (this.notificationService.confirm(`¿Está seguro de ${accion} esta página?`)) {
      this.webService.deletePagina(pagina.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPaginas();
  }
}

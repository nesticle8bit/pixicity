import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { DialogCreateUpdateCategoriasComponent } from '../dialog-create-update-categorias/dialog-create-update-categorias.component';

@Component({
  selector: 'app-table-categorias',
  templateUrl: './table-categorias.component.html',
  styleUrls: ['./table-categorias.component.scss'],
})
export class TableCategoriasComponent implements OnInit {
  public categorias: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private parametrosService: IHttpParametrosService,
    private dialog: MatDialog
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 30, length: 0 });
  }

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.parametrosService.getCategoriasAdmin().subscribe((response: any) => {
      this.categorias = response.categorias;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getCategorias();
  }

  updateCategoria(categoria: any): void {
    const dialogRef = this.dialog.open(DialogCreateUpdateCategoriasComponent, {
      width: '1280px',
      data: categoria,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value) {
        this.getCategorias();
      }
    });
  }

  deleteCategoria(categoriaId: number, index: number): void {

  }
}

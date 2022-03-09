import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { DialogUpdatePaisesComponent } from '../dialog-update-paises/dialog-update-paises.component';

@Component({
  selector: 'app-table-paises',
  templateUrl: './table-paises.component.html',
  styleUrls: ['./table-paises.component.scss'],
})
export class TablePaisesComponent implements OnInit {
  public paises: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private parametrosService: IHttpParametrosService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getPaises();
  }

  getPaises(): void {
    this.parametrosService.getPaises().subscribe((response: any) => {
      if(response.data) {
        response.data = response.data.map((pais: any) => {
          pais.isO2 = pais.isO2?.toLowerCase();
          return pais;
        });
      }

      this.paises = response?.data;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  updatePais(index: number): void {
    const pais = this.paises[index];

    const dialogRef = this.dialog.open(DialogUpdatePaisesComponent, {
      width: '600px',
      data: pais,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value) {
        this.getPaises();
      }
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getPaises();
  }
}

import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUpdateRangoComponent } from 'src/app/components/dialogs/dialog-add-update-rango/dialog-add-update-rango.component';

@Component({
  selector: 'app-table-rangos',
  templateUrl: './table-rangos.component.html',
  styleUrls: ['./table-rangos.component.scss'],
})
export class TableRangosComponent implements OnInit {
  public rangos: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getRangos();
  }

  getRangos(): void {
    this.securityService.getRangosUsuarios().subscribe((response: any) => {
      this.rangos = response?.rangos;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getRangos();
  }

  addRango(): void {
    const dialogRef = this.dialog.open(DialogAddUpdateRangoComponent, {
      width: '580px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((value: number) => {
      if (value) {
        this.getRangos();
      }
    });
  }

  updateRango(rango: any): void {
    const dialogRef = this.dialog.open(DialogAddUpdateRangoComponent, {
      width: '580px',
      data: rango,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((value: number) => {
      if (value) {
        this.getRangos();
      }
    });
  }

  deleteRango(id: number): void {}
}

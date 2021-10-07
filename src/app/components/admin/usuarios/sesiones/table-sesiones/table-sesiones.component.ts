import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-table-sesiones',
  templateUrl: './table-sesiones.component.html',
  styleUrls: ['./table-sesiones.component.scss'],
})
export class TableSesionesComponent implements OnInit {
  public sesiones: any[] = [];
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
    this.securityService.getSesiones().subscribe((response: any) => {
      this.sesiones = response?.data;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  clipboard(text: string): void {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.snackBar.open('Texto copiado al portapapeles', '', {
      duration: 3 * 1000
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getSesiones();
  }
}

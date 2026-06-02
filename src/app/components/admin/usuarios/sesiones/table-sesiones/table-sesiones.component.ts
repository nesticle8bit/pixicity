import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-sesiones',
  templateUrl: './table-sesiones.component.html',
  styleUrls: ['./table-sesiones.component.scss'],
})
export class TableSesionesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public sesiones: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getSesiones();
  }

  getSesiones(): void {
    this.securityService.getSesiones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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

  deleteSession(id: number): void {
    if (this.notificationService.confirm('¿Está seguro de eliminar esta sesión del usuario?')) {
      this.securityService.deleteSessionById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if(response) {
          this.notificationService.success('La sesión ha sido eliminado correctamente', 'Eliminado');
          this.getSesiones();
        }
      });
    }
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getSesiones();
  }
}

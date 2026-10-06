import { finalize } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
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

  public filtro: AdminFiltro = {};
  public cargando = false;
  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar por usuario o IP...',
    fechas: true,
    estado: true,
    orden: true,
    usuario: 'Usuario',
    tipos: [
      { valor: 'vigentes', label: 'Vigentes' },
    ],
  };

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
    this.cargando = true;
    this.securityService.getSesiones(this.filtro).pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
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
      this.securityService.deleteSessionById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if(response) {
          this.notificationService.success('La sesión ha sido eliminado correctamente', 'Eliminado');
          this.getSesiones();
        }
      });
    }
  }

  /** Nuevo filtro desde <app-admin-filtros>: vuelve a la primera página. */
  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getSesiones();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getSesiones();
  }
}

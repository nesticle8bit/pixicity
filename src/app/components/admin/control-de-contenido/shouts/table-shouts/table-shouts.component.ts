import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-shouts',
  templateUrl: './table-shouts.component.html',
  styleUrls: ['./table-shouts.component.scss'],
})
export class TableShoutsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public shouts: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private perfilService: IHttpPerfilService,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getShouts();
  }

  getShouts(): void {
    this.perfilService.getShoutsAdmin().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.shouts = response.shouts;
      this.totalCount = response.pagination.totalCount;
    });
  }

  deleteShout(id: number, index: number): void {
    this.perfilService.deleteShout(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        this.notificationService.success('El shout ha sido eliminado exitosamente', 'Eliminado');

        if (this.shouts[index]) {
          this.shouts[index].eliminado = true;
        }
      }
    });
  }

  recoveryShout(id: number, index: number): void {
    this.perfilService.recoveryShout(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        this.notificationService.success('El shout ha sido recuperado exitosamente', 'Recuperado');

        if (this.shouts[index]) {
          this.shouts[index].eliminado = false;
        }
      }
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getShouts();
  }
}

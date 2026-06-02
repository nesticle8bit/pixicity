import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';

@Component({
  standalone: false,
  selector: 'app-dashboard-estadisticas',
  templateUrl: './dashboard-estadisticas.component.html',
  styleUrls: ['./dashboard-estadisticas.component.scss']
})
export class DashboardEstadisticasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public stats: any = null;
  public loading = true;

  constructor(private generalService: IHttpGeneralService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.generalService.getAdminEstadisticas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get onlinePct(): number {
    if (!this.stats?.totalUsuarios) return 0;
    return Math.round((this.stats.usuariosOnlineRegistrados / this.stats.totalUsuarios) * 100);
  }

  get comentariosPorPost(): string {
    if (!this.stats?.totalPosts || !this.stats?.totalComentarios) return '0';
    return (this.stats.totalComentarios / this.stats.totalPosts).toFixed(1);
  }
}

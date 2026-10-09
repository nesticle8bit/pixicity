import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { enNavegador } from '../../../shared/helpers/plataforma';

@Component({
    selector: 'app-home-stats',
    templateUrl: './home-stats.component.html',
    styleUrls: ['./home-stats.component.scss'],
    imports: [RouterLink, DatePipe],
})
export class HomeStatsComponent implements OnInit, OnDestroy {
  private generalService = inject(IHttpGeneralService);

  private readonly destroyRef = inject(DestroyRef);

  public estadisticas: any;

  // Refresca el contador online para que no quede congelado en el valor de carga.
  private readonly refreshMs = 120000;
  private refreshTimer: any = null;

  ngOnInit(): void {
    this.loadStats();

    if (enNavegador()) this.refreshTimer = setInterval(() => this.loadStats(), this.refreshMs);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private loadStats(): void {
    this.generalService.getEstadisticas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.estadisticas = values;
    });
  }
}

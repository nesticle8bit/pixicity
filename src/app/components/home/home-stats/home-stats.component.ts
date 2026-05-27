import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-home-stats',
  templateUrl: './home-stats.component.html',
  styleUrls: ['./home-stats.component.scss'],
})
export class HomeStatsComponent implements OnInit, OnDestroy {
  public estadisticas: any;

  // Refresca el contador online para que no quede congelado en el valor de carga.
  private readonly refreshMs = 120000;
  private refreshTimer: any = null;

  constructor(private generalService: IHttpGeneralService) {}

  ngOnInit(): void {
    this.loadStats();

    this.refreshTimer = setInterval(() => this.loadStats(), this.refreshMs);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private loadStats(): void {
    this.generalService.getEstadisticas().subscribe((values: any) => {
      this.estadisticas = values;
    });
  }
}

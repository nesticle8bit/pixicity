import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';

@Component({
    selector: 'app-comunidades-stats',
    templateUrl: './comunidades-stats.component.html',
    styleUrls: ['./comunidades-stats.component.scss'],
})
export class ComunidadesStatsComponent implements OnInit {
  private comunidadesService = inject(IHttpComunidadesService);

  private readonly destroyRef = inject(DestroyRef);

  public stats: any = {};

  ngOnInit(): void {
    this.comunidadesService.getEstadisticas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => {
      this.stats = v ?? {};
    });
  }
}

import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';

@Component({
  standalone: false,
  selector: 'app-comunidades-stats',
  templateUrl: './comunidades-stats.component.html',
  styleUrls: ['./comunidades-stats.component.scss'],
})
export class ComunidadesStatsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public stats: any = {};

  constructor(private comunidadesService: IHttpComunidadesService) {}

  ngOnInit(): void {
    this.comunidadesService.getEstadisticas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v: any) => {
      this.stats = v ?? {};
    });
  }
}

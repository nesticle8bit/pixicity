import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ThumbPipe } from '../../../../shared/pipes/thumb.pipe';
import { enNavegador } from '../../../../shared/helpers/plataforma';

@Component({
    selector: 'app-comunidades-top',
    templateUrl: './comunidades-top.component.html',
    styleUrls: ['./comunidades-top.component.scss'],
    imports: [ThumbPipe, MatTooltip, RouterLink],
})
export class ComunidadesTopComponent implements OnInit, OnDestroy {
  private comunidadesService = inject(IHttpComunidadesService);

  private readonly destroyRef = inject(DestroyRef);

  public comunidades: any[] = [];
  public loading = true;
  public currentIndex = 0;
  public paused = false;

  private readonly interval = 4000;
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.comunidadesService.getTopComunidades(5).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any[]) => {
        this.comunidades = data || [];
        this.loading = false;
        if (this.comunidades.length > 1) this.startTimer();
      },
      error: () => { this.loading = false; },
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  togglePause(): void {
    this.paused = !this.paused;
    this.paused ? this.stopTimer() : this.startTimer();
  }

  startTimer(): void {
    if (this.paused) return;
    this.stopTimer();
    if (enNavegador()) this.timer = setInterval(() => this.next(), this.interval);
  }

  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.comunidades.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.comunidades.length) % this.comunidades.length;
  }

  goTo(i: number): void {
    this.currentIndex = i;
    this.startTimer();
  }
}

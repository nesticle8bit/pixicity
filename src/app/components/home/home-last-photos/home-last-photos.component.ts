import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ThumbPipe } from '../../../shared/pipes/thumb.pipe';
import { enNavegador } from '../../../shared/helpers/plataforma';

@Component({
    selector: 'app-home-last-photos',
    templateUrl: './home-last-photos.component.html',
    styleUrls: ['./home-last-photos.component.scss'],
    imports: [ThumbPipe, MatTooltip, RouterLink]
})
export class HomeLastPhotosComponent implements OnInit, OnDestroy {
  private fotosService = inject(IHttpFotosService);

  private readonly destroyRef = inject(DestroyRef);

  public fotos: any[] = [];
  public loading = true;
  public currentIndex = 0;
  public paused = false;

  private readonly interval = 4000;
  private timer: any = null;

  ngOnInit(): void {
    this.fotosService.getTopFotos(5).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any[]) => {
        this.fotos = data || [];
        this.loading = false;
        if (this.fotos.length > 1) this.startTimer();
      },
      error: () => { this.loading = false; }
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
    this.currentIndex = (this.currentIndex + 1) % this.fotos.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.fotos.length) % this.fotos.length;
  }

  goTo(i: number): void {
    this.currentIndex = i;
    this.startTimer();
  }
}

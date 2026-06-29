import {
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';

@Component({
  standalone: false,
  selector: 'app-home-last-shouts',
  templateUrl: './home-last-shouts.component.html',
  styleUrls: ['./home-last-shouts.component.scss'],
})
export class HomeLastShoutsComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

  public shouts: any[] = [];
  public loading = true;
  public currentIndex = 0;
  public paused = false;

  private readonly interval = 4000;
  private timer: any = null;

  constructor(private perfilService: IHttpPerfilService) {}

  ngOnInit(): void {
    this.perfilService
      .getTopShouts(6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any[]) => {
          this.shouts = data || [];
          this.loading = false;
          if (this.shouts.length > 1) this.startTimer();
        },
        error: () => {
          this.loading = false;
        },
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
    this.timer = setInterval(() => this.next(), this.interval);
  }

  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.shouts.length;
  }

  prev(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.shouts.length) % this.shouts.length;
  }

  goTo(i: number): void {
    this.currentIndex = i;
    this.startTimer();
  }
}

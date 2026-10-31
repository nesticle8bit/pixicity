import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { NsfwService } from 'src/app/services/shared/nsfw.service';
import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { enNavegador } from '../../../shared/helpers/plataforma';
import { enlaceShout, imagenShout } from '../../../shared/helpers/shout-imagen';

/**
 * Top 5 de shouts de la semana (misma "actividad" que /mi → Más activos) en un carrusel como el de Top Fotos.
 * Incluye los NSFW, con la imagen difuminada salvo que la cuenta haya elegido verlos sin difuminar.
 */
@Component({
    selector: 'app-home-top-shouts',
    templateUrl: './home-top-shouts.component.html',
    // Mismo carrusel que Top Fotos; acá solo lo propio de los shouts.
    styleUrls: ['../home-last-photos/home-last-photos.component.scss', './home-top-shouts.component.scss'],
    imports: [MatTooltip, RouterLink]
})
export class HomeTopShoutsComponent implements OnInit, OnDestroy {
  private miService = inject(IHttpMiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly preferenciaNsfw = inject(NsfwService);

  public shouts: ShoutViewModel[] = [];
  public loading = true;
  public currentIndex = 0;
  public paused = false;

  private readonly interval = 5000;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.miService.getActivos('semana', 1, 5, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (muro) => {
        this.shouts = muro.items.map((i) => i.shout).filter((s): s is ShoutViewModel => !!s);
        this.loading = false;
        if (this.shouts.length > 1) this.startTimer();
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  /** Imagen de fondo de la diapositiva. */
  readonly imagen = imagenShout;
  readonly enlace = enlaceShout;

  difuminar(s: ShoutViewModel): boolean {
    return !!s.nsfw && !this.preferenciaNsfw.mostrar();
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
    this.currentIndex = (this.currentIndex + 1) % this.shouts.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.shouts.length) % this.shouts.length;
  }

  goTo(i: number): void {
    this.currentIndex = i;
    this.startTimer();
  }
}

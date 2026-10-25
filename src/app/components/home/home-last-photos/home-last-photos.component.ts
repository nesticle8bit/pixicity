import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { PortadaService } from 'src/app/services/shared/portada.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ThumbFotoPipe } from '../../../shared/pipes/thumb.pipe';
import { enNavegador } from '../../../shared/helpers/plataforma';
import { FotoViewModel } from 'src/app/models/fotos/foto-vm.model';

@Component({
    selector: 'app-home-last-photos',
    templateUrl: './home-last-photos.component.html',
    styleUrls: ['./home-last-photos.component.scss'],
    imports: [ThumbFotoPipe, MatTooltip, RouterLink]
})
export class HomeLastPhotosComponent implements OnInit, OnDestroy {
  private fotosService = inject(IHttpFotosService);

  private readonly destroyRef = inject(DestroyRef);
  private portada = inject(PortadaService);

  public fotos: FotoViewModel[] = [];
  public loading = true;
  public currentIndex = 0;
  public paused = false;

  /** Diapositivas cuya imagen ya se pidió: la visible y la siguiente. Antes se bajaban las 5 (varios MB) al entrar. */
  private readonly cargadas = new Set<number>([0, 1]);

  private readonly interval = 4000;
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.portada.tomar('fotos', this.fotosService.getTopFotos(5)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
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
    this.mostrar((this.currentIndex + 1) % this.fotos.length);
  }

  prev(): void {
    this.mostrar((this.currentIndex - 1 + this.fotos.length) % this.fotos.length);
  }

  goTo(i: number): void {
    this.mostrar(i);
    this.startTimer();
  }

  debeCargar(i: number): boolean {
    return this.cargadas.has(i);
  }

  private mostrar(i: number): void {
    this.currentIndex = i;
    // La siguiente se pide con anticipación para que no aparezca en blanco al rotar.
    this.cargadas.add(i).add((i + 1) % this.fotos.length);
  }
}

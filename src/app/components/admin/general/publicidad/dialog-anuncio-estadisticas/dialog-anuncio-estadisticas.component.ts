import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { IHttpAnunciosService } from 'src/app/services/interfaces/httpAnuncios.interface';
import { AnuncioAdmin, AnuncioEstadisticaDia, ctr } from 'src/app/models/web/anuncio.model';

/** Impresiones, clics y CTR por día de un anuncio (30 o 90 días). */
@Component({
  selector: 'app-dialog-anuncio-estadisticas',
  templateUrl: './dialog-anuncio-estadisticas.component.html',
  styleUrls: ['./dialog-anuncio-estadisticas.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, DatePipe, DecimalPipe],
})
export class DialogAnuncioEstadisticasComponent {
  private anunciosService = inject(IHttpAnunciosService);
  private readonly destroyRef = inject(DestroyRef);

  readonly anuncio = inject<AnuncioAdmin>(MAT_DIALOG_DATA);
  readonly ctr = ctr;
  readonly dias = signal(30);
  readonly cargando = signal(true);
  /** Del más nuevo al más viejo. */
  readonly filas = signal<AnuncioEstadisticaDia[]>([]);
  readonly totales = computed(() =>
    this.filas().reduce((t, f) => ({ impresiones: t.impresiones + f.impresiones, clics: t.clics + f.clics }), { impresiones: 0, clics: 0 }));
  readonly maximo = computed(() => Math.max(1, ...this.filas().map((f) => f.impresiones)));

  constructor() {
    this.cargar(30);
  }

  cargar(dias: number): void {
    this.dias.set(dias);
    this.cargando.set(true);
    this.anunciosService.getEstadisticas(this.anuncio.id, dias).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (filas) => {
        this.filas.set([...filas].reverse());
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}

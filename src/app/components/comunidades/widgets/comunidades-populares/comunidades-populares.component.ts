import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { TopComunidad } from 'src/app/models/web/tops.model';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { TopTimesSelectorComponent } from '../../../sections/top-times-selector/top-times-selector.component';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { ThumbPipe } from '../../../../shared/pipes/thumb.pipe';

/** Comunidades más populares (más miembros) del período, con el formato de app-home-top-posts. */
@Component({
    selector: 'app-comunidades-populares',
    templateUrl: './comunidades-populares.component.html',
    styleUrls: ['./comunidades-populares.component.scss'],
    imports: [TopTimesSelectorComponent, NgClass, RouterLink, MatTooltip, TruncatePipe, ThumbPipe],
})
export class ComunidadesPopularesComponent implements OnInit {
  private httpWeb = inject(IHttpWebService);

  private readonly destroyRef = inject(DestroyRef);

  public periodo: string = 'all';
  public loading: boolean = false;
  public comunidades: TopComunidad[] = [];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;

    this.httpWeb
      .getTopComunidades(this.periodo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (v) => {
          this.comunidades = v?.conMasMiembros ?? [];
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  cambiarPeriodo(periodo: string): void {
    if (!periodo) {
      return;
    }

    this.periodo = periodo;
    this.cargar();
  }
}

import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { TopTimesSelectorComponent } from '../../../sections/top-times-selector/top-times-selector.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-comunidades-top-temas',
    templateUrl: './comunidades-top-temas.component.html',
    styleUrls: ['./comunidades-top-temas.component.scss'],
    imports: [TopTimesSelectorComponent, RouterLink],
})
export class ComunidadesTopTemasComponent implements OnInit {
  private comunidadesService = inject(IHttpComunidadesService);

  private readonly destroyRef = inject(DestroyRef);

  public temas: any[] = [];
  public periodo: string = 'ultimos7dias';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.comunidadesService.getTopTemasGlobal(this.periodo, 5).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => {
      this.temas = v ?? [];
    });
  }

  cambiarPeriodo(periodo: string): void {
    this.periodo = periodo;
    this.cargar();
  }
}

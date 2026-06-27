import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';

@Component({
  standalone: false,
  selector: 'app-comunidades-top-temas',
  templateUrl: './comunidades-top-temas.component.html',
  styleUrls: ['./comunidades-top-temas.component.scss'],
})
export class ComunidadesTopTemasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public temas: any[] = [];
  public periodo: string = 'ultimos7dias';

  constructor(private comunidadesService: IHttpComunidadesService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.comunidadesService.getTopTemasGlobal(this.periodo, 5).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v: any) => {
      this.temas = v ?? [];
    });
  }

  cambiarPeriodo(periodo: string): void {
    this.periodo = periodo;
    this.cargar();
  }
}

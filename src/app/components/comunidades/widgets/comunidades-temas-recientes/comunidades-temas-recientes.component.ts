import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';

@Component({
  standalone: false,
  selector: 'app-comunidades-temas-recientes',
  templateUrl: './comunidades-temas-recientes.component.html',
  styleUrls: ['./comunidades-temas-recientes.component.scss'],
})
export class ComunidadesTemasRecientesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public temas: any[] = [];
  public loading: boolean = true;

  constructor(private comunidadesService: IHttpComunidadesService) {}

  ngOnInit(): void {
    this.comunidadesService.getTemasRecientes(15).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (v: any) => { this.temas = v ?? []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}

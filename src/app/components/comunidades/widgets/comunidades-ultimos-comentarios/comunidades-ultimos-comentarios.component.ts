import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';

@Component({
  standalone: false,
  selector: 'app-comunidades-ultimos-comentarios',
  templateUrl: './comunidades-ultimos-comentarios.component.html',
  styleUrls: ['./comunidades-ultimos-comentarios.component.scss'],
})
export class ComunidadesUltimosComentariosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public comentarios: any[] = [];
  public refreshComments: boolean = false;

  constructor(private comunidadesService: IHttpComunidadesService) {}

  ngOnInit(): void {
    this.getUltimosComentarios();
  }

  getUltimosComentarios(): void {
    this.refreshComments = true;

    this.comunidadesService.getComentariosRecientesGlobal(8).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v: any) => {
      this.comentarios = v ?? [];
      this.refreshComments = false;
    });
  }
}

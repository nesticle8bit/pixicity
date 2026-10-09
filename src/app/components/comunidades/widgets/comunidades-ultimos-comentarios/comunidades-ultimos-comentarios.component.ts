import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { ComentarioReciente, RecentCommentsListComponent } from '../../../addons/recent-comments-list/recent-comments-list.component';

@Component({
    selector: 'app-comunidades-ultimos-comentarios',
    template: `
    <app-recent-comments-list [comentarios]="comentarios" [cargando]="cargando"
      mensajeVacio="Aún no se han realizado comentarios en las comunidades" (actualizar)="getUltimosComentarios()">
    </app-recent-comments-list>
  `,
    imports: [RecentCommentsListComponent],
})
export class ComunidadesUltimosComentariosComponent implements OnInit {
  private comunidadesService = inject(IHttpComunidadesService);

  private readonly destroyRef = inject(DestroyRef);

  public comentarios: ComentarioReciente[] = [];
  public cargando: boolean = false;

  ngOnInit(): void {
    this.getUltimosComentarios();
  }

  getUltimosComentarios(): void {
    this.cargando = true;

    this.comunidadesService.getComentariosRecientesGlobal(8).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => {
      this.comentarios = (v ?? []).map((c: any) => ({
        usuario: c.userName,
        titulo: c.temaTitulo,
        link: ['/comunidades', c.comunidadSlug, 'tema', c.temaId, c.temaUrl],
      }));
      this.cargando = false;
    });
  }
}

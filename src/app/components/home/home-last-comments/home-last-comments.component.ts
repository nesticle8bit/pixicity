import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { ComentarioReciente } from '../../addons/recent-comments-list/recent-comments-list.component';

@Component({
  standalone: false,
  selector: 'app-home-last-comments',
  template: `
    <app-recent-comments-list [comentarios]="comentarios" [cargando]="cargando"
      mensajeVacio="Aún no se han realizado comentarios en Taringa!" (actualizar)="getUltimosComentarios()">
    </app-recent-comments-list>
  `,
})
export class HomeLastCommentsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public cargando: boolean = false;
  public comentarios: ComentarioReciente[] = [];

  constructor(private postService: IHttpPostsService) {}

  ngOnInit(): void {
    this.getUltimosComentarios();
  }

  getUltimosComentarios(): void {
    this.cargando = true;

    this.postService
      .getUltimosComentarios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((comentarios: any[]) => {
        this.comentarios = (comentarios ?? []).map((c) => ({
          usuario: c.usuario,
          titulo: c.post.titulo,
          link: ['/posts', c.post.categoria.seo, c.post.id, c.post.url],
        }));
        this.cargando = false;
      });
  }
}

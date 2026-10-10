import { Subscription } from 'rxjs';
import { PostDetalle, PostSimpleViewModel } from 'src/app/models/posts/post-vm.model';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PostRankListComponent } from '../post-rank-list/post-rank-list.component';

@Component({
    selector: 'app-post-related-posts',
    template: `
    <app-post-rank-list titulo="Posts Relacionados" icono="ti-stack-2"
      mensajeVacio="Sin posts relacionados" iconoVacio="ti-target-off" [posts]="relatedPosts">
    </app-post-rank-list>
  `,
    imports: [PostRankListComponent],
})
export class PostRelatedPostsComponent implements OnInit {
  private postService = inject(IHttpPostsService);

  private readonly destroyRef = inject(DestroyRef);
  private cargaGetRelatedPosts?: Subscription;

  private _post: PostDetalle | null = null;

  @Input() set post(value: PostDetalle | null) {
    this._post = value;

    if (value && value.id) {
      this.getRelatedPosts(value.id);
    }
  }

  get post(): PostDetalle | null {
    return this._post;
  }

  public relatedPosts: PostSimpleViewModel[] = [];

  ngOnInit(): void {}

  getRelatedPosts(postId: number): void {
    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetRelatedPosts?.unsubscribe();

    this.cargaGetRelatedPosts = this.postService.getRelatedPosts(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.relatedPosts = value;
    });
  }
}

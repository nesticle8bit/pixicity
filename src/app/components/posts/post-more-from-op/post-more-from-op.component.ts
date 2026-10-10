import { Subscription } from 'rxjs';
import { PostDetalle, PostSimpleViewModel } from 'src/app/models/posts/post-vm.model';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PostRankListComponent } from '../post-rank-list/post-rank-list.component';

@Component({
    selector: 'app-post-more-from-op',
    template: `
    <app-post-rank-list [titulo]="'Más de ' + (post?.usuario?.userName ?? '')" icono="ti-user-star"
      mensajeVacio="Este autor no tiene más posts" iconoVacio="ti-mood-empty" [posts]="posts">
    </app-post-rank-list>
  `,
    imports: [PostRankListComponent],
})
export class PostMoreFromOPComponent implements OnInit {
  private postService = inject(IHttpPostsService);

  private readonly destroyRef = inject(DestroyRef);
  private cargaGetPostsFromOP?: Subscription;

  public posts: PostSimpleViewModel[] = [];
  private _post: PostDetalle | null = null;

  @Input() set post(value: PostDetalle | null) {
    this._post = value;

    if (value && value.id) {
      this.getPostsFromOP(value.id);
    }
  }

  get post(): PostDetalle | null {
    return this._post;
  }

  ngOnInit(): void {}

  getPostsFromOP(postId: number): void {
    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetPostsFromOP?.unsubscribe();

    this.cargaGetPostsFromOP = this.postService.getPostsFromOP(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.posts = value;
    });
  }
}

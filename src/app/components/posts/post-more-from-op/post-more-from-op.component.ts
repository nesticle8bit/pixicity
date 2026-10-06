import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-post-more-from-op',
  template: `
    <app-post-rank-list [titulo]="'Más de ' + (post?.usuario?.userName ?? '')" icono="ti-user-star"
      mensajeVacio="Este autor no tiene más posts" iconoVacio="ti-mood-empty" [posts]="posts">
    </app-post-rank-list>
  `,
})
export class PostMoreFromOPComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public posts: any[] = [];
  private _post: any;

  @Input() set post(value: any) {
    this._post = value;

    if (value && value.id) {
      this.getPostsFromOP(value.id);
    }
  }

  get post(): any {
    return this._post;
  }

  constructor(private postService: IHttpPostsService) {}

  ngOnInit(): void {}

  getPostsFromOP(postId: number): void {
    this.postService.getPostsFromOP(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.posts = value;
    });
  }
}

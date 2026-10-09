import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { Component, DestroyRef, inject, OnInit, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-posts-nav',
    templateUrl: './posts-nav.component.html',
    styleUrls: ['./posts-nav.component.scss'],
    imports: [MatTooltip],
})
export class PostsNavComponent implements OnInit {
  private postService = inject(IHttpPostsService);
  private router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);

  readonly post = input<any>();

  ngOnInit(): void {}

  nextPost(postId: number): void {
    this.postService.nextPost(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.router.navigate([
          '/posts/' + value.categoria.seo + '/' + value.id + '/' + value.url,
        ]);
      }
    });
  }

  prevPost(postId: number): void {
    this.postService.previousPost(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.router.navigate([
          '/posts/' + value.categoria.seo + '/' + value.id + '/' + value.url,
        ]);
      }
    });
  }

  randomPost(postId: number): void {
    this.postService.randomPost(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.router.navigate([
          '/posts/' + value.categoria.seo + '/' + value.id + '/' + value.url,
        ]);
      }
    });
  }
}

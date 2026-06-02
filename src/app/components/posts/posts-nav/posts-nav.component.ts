import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-posts-nav',
  templateUrl: './posts-nav.component.html',
  styleUrls: ['./posts-nav.component.scss'],
})
export class PostsNavComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input() post: any;

  constructor(private postService: IHttpPostsService, private router: Router) {}

  ngOnInit(): void {}

  nextPost(postId: number): void {
    this.postService.nextPost(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      if (value) {
        this.router.navigate([
          '/posts/' + value.categoria.seo + '/' + value.id + '/' + value.url,
        ]);
      }
    });
  }

  prevPost(postId: number): void {
    this.postService.previousPost(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      if (value) {
        this.router.navigate([
          '/posts/' + value.categoria.seo + '/' + value.id + '/' + value.url,
        ]);
      }
    });
  }

  randomPost(postId: number): void {
    this.postService.randomPost(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      if (value) {
        this.router.navigate([
          '/posts/' + value.categoria.seo + '/' + value.id + '/' + value.url,
        ]);
      }
    });
  }
}

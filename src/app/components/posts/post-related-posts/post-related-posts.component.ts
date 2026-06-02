import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-post-related-posts',
  templateUrl: './post-related-posts.component.html',
  styleUrls: ['./post-related-posts.component.scss'],
})
export class PostRelatedPostsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  private _post: any;

  @Input() set post(value: any) {
    this._post = value;

    if (value && value.id) {
      this.getRelatedPosts(value.id);
    }
  }

  get post(): any {
    return this._post;
  }

  public relatedPosts: any = [];
  constructor(private postService: IHttpPostsService) {}

  ngOnInit(): void {}

  getRelatedPosts(postId: number): void {
    this.postService.getRelatedPosts(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      this.relatedPosts = value;
    });
  }
}

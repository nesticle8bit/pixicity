import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-post-related-posts',
  templateUrl: './post-related-posts.component.html',
  styleUrls: ['./post-related-posts.component.scss'],
})
export class PostRelatedPostsComponent implements OnInit {
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
    this.postService.getRelatedPosts(postId).subscribe((value: any) => {
      this.relatedPosts = value;
    });
  }
}

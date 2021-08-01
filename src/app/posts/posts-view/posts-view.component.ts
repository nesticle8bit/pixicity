import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';

@Component({
  selector: 'app-posts-view',
  templateUrl: './posts-view.component.html',
  styleUrls: ['./posts-view.component.scss']
})
export class PostsViewComponent implements OnInit {
  public postId: number = 0;
  public post: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: IHttpPostsService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((values: any) => {
      this.postId = values.get('id');

      this.postService.getPostById(this.postId).subscribe((post: any) => {
        if(post) {
          post.tags = post.etiquetas.split(',')
        }

        console.log(post);
        this.post = post;
      });
    });
  }

}

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
  public usuario: any;
  public comentarios: any;
  public show: boolean = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: IHttpPostsService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((values: any) => {
      this.postId = values.get('id');

      this.getPostById();
      this.getComentariosByPostId();
    });
  }

  getPostById(): void {
    this.postService.getPostById(this.postId).subscribe((value: any) => {
      if (value.post) {
        value.post.tags = value.post.etiquetas.split(',')
      }

      this.post = value.post;
      this.usuario = value.usuario;
    });
  }

  getComentariosByPostId(): void {
    this.postService.getComentariosByPostId(this.postId).subscribe((response: any) => {
      if(response) {
        response = response.map((comentario: any) => {
          comentario.actions = false;
          return comentario;
        });
      }

      this.comentarios = response;
    });
  }
}

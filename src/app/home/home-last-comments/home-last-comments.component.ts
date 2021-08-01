import { Component, OnInit } from '@angular/core';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';

@Component({
  selector: 'app-home-last-comments',
  templateUrl: './home-last-comments.component.html',
  styleUrls: ['./home-last-comments.component.scss']
})
export class HomeLastCommentsComponent implements OnInit {
  public lastComments: any = [];

  constructor(
    private postService: IHttpPostsService
  ) { }

  ngOnInit(): void {
    this.getUltimosComentarios();
  }

  getUltimosComentarios(): void {
    this.postService.getUltimosComentarios().subscribe((comentarios: any) => {
      this.lastComments = comentarios;
    });
  }

}

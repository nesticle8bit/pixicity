import { Component, OnInit } from '@angular/core';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';

@Component({
  selector: 'app-home-last-comments',
  templateUrl: './home-last-comments.component.html',
  styleUrls: ['./home-last-comments.component.scss'],
})
export class HomeLastCommentsComponent implements OnInit {
  public refreshComments: boolean = false;
  public lastComments: any = [];

  constructor(private postService: IHttpPostsService) {}

  ngOnInit(): void {
    this.getUltimosComentarios();
    console.log(` __________________________
    / No lo hagas, no abras la \
    \ consola, es peligroso 🥺 /
     --------------------------
             \
              \
               ___
              (o o)
             (  V  )
            /--m-m-
    `);
  }

  getUltimosComentarios(): void {
    this.refreshComments = true;
    this.postService.getUltimosComentarios().subscribe((comentarios: any) => {
      this.lastComments = comentarios;
      this.refreshComments = false;
    });
  }
}

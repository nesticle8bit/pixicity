import { Component, Input, OnInit } from '@angular/core';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-posts-meta',
  templateUrl: './posts-meta.component.html',
  styleUrls: ['./posts-meta.component.scss']
})
export class PostsMetaComponent implements OnInit {
  @Input() post: any;
  public addedPuntos: boolean = false;
  public availablePuntos: number[] = [];
  public currentUser: any;

  constructor(
    private securityService: IHttpSecurityService,
    private postService: IHttpPostsService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.getAvailablePuntos();
  }

  getAvailablePuntos(): void {
    this.postService.getAvailableVotos(1).subscribe((response: any) => {
      if (response > 0) {
        for (let index = 1; index < response + 1; index++) {
          if (this.availablePuntos.length < 10) {
            this.availablePuntos.push(index);
          } else {
            return;
          }
        }
      }
    });
  }

  votarPost(puntos: number): void {
    this.postService.setVotos({ typeId: this.post.id, cantidad: puntos, votosType: 1 }).subscribe((response: any) => {
      if (response) {
        this.addedPuntos = true;
        this.post.puntos += puntos;
      }
    });
  }
}

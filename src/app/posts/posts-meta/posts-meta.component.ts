import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogDenunciarPostComponent } from 'src/app/components/dialogs/dialog-denunciar-post/dialog-denunciar-post.component';

@Component({
  selector: 'app-posts-meta',
  templateUrl: './posts-meta.component.html',
  styleUrls: ['./posts-meta.component.scss']
})
export class PostsMetaComponent implements OnInit {
  private _post: any;

  @Input() set post(value: any) {
    this._post = value;

    if (value) {
      this.getAvailablePuntos();
    }
  }

  get post(): any {
    return this._post;
  }

  public addedPuntos: boolean = false;
  public availablePuntos: number[] = [];
  public currentUser: any;

  constructor(
    private securityService: IHttpSecurityService,
    private postService: IHttpPostsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  getAvailablePuntos(): void {
    this.postService.getAvailableVotos(1).subscribe((response: any) => {
      console.log('response', response);

      if (response > 0) {
        for (let index = 1; index < response; index++) {
          this.availablePuntos.push(index);
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

  agregarFavorito(postId: number): void {
    this.postService.addFavoritePost(postId).subscribe((response: any) => {

    });
  }

  denunciarPost(): void {
    this.dialog.open(DialogDenunciarPostComponent, {
      width: '600px',
      disableClose: true,
      data: this.post,
    });
  }
}

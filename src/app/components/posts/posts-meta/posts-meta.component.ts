import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogDenunciarPostComponent } from 'src/app/components/dialogs/dialog-denunciar-post/dialog-denunciar-post.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { DialogRecomendarPostComponent } from 'src/app/components/dialogs/dialog-recomendar-post/dialog-recomendar-post.component';

@Component({
  selector: 'app-posts-meta',
  templateUrl: './posts-meta.component.html',
  styleUrls: ['./posts-meta.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class PostsMetaComponent implements OnInit {
  public savedToFavorites: any = {
    message: '',
    type: false,
    display: false,
  };

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
  ) {}

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  getAvailablePuntos(): void {
    if (!this.currentUser?.usuario) {
      return;
    }

    this.postService.getAvailableVotos(1).subscribe((response: any) => {
      this.availablePuntos = [];

      if (response > 0) {
        for (let index = 1; index < response + 1; index++) {
          this.availablePuntos.push(index);
        }
      }
    });
  }

  votarPost(puntos: number): void {
    this.postService
      .setVotos({ typeId: this.post.id, cantidad: puntos, votosType: 1 })
      .subscribe((response: any) => {
        if (response) {
          this.addedPuntos = true;
          this.post.puntos += puntos;
        }
      });
  }

  recomendarPost(postId: number): void {
    this.dialog.open(DialogRecomendarPostComponent, {
      width: '500px',
      disableClose: true,
      data: postId,
    });
  }

  agregarFavorito(postId: number): void {
    this.postService.addFavoritePost(postId).subscribe((response: any) => {
      if (response) {
        this.savedToFavorites = {
          message: 'Bien! Este post fue agregado a tus favoritos.',
          type: true,
          display: true,
        };
      } else {
        this.savedToFavorites = {
          message: 'Este post ya lo tienes en tus favoritos.',
          type: false,
          display: true,
        };
      }

      setTimeout(() => {
        this.savedToFavorites.display = false;
      }, 3000);
    });
  }

  denunciarPost(): void {
    this.dialog.open(DialogDenunciarPostComponent, {
      width: '600px',
      disableClose: true,
      data: this.post,
    });
  }

  seguirPost(): void {
    const postId = this.post.id;

    if (!postId) {
      return;
    }

    this.postService.seguirPost(postId).subscribe((value: any) => {
      if (value) {
        this.post.seguirPost = !this.post.seguirPost;
      }
    });
  }
}

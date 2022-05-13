import { BottomSheetsEmojisComponent } from 'src/app/components/bottom-sheets/bottom-sheets-emojis/bottom-sheets-emojis.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss'],
})
export class PostCommentsComponent implements OnInit {
  public commented: boolean = false;
  private _post: any;

  @Input() set post(value: any) {
    this._post = value;
    this.getComentariosByPostId();
  }

  get post(): any {
    return this._post;
  }

  public formGroup: FormGroup;
  public comentarios: any = [];
  public currentUser: any;
  public displayEmojis: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private bottomSheet: MatBottomSheet,
    private postService: IHttpPostsService,
    private securityService: IHttpSecurityService
  ) {
    this.formGroup = this.formBuilder.group({
      contenido: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  enviarComentario(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const comentario = Object.assign({}, this.formGroup.value);
    comentario.postId = this.post?.id;

    this.postService.addComentario(comentario).subscribe((response: any) => {
      if (response) {
        this.formGroup.patchValue({
          contenido: '',
        });

        this.comentarios.push({
          id: response,
          userName: this.currentUser.usuario.userName,
          avatar: this.currentUser.usuario.avatar,
          contenido: comentario.contenido,
          fechaComentario: new Date(),
        });

        this.commented = true;
      }
    });
  }

  getComentariosByPostId(): void {
    this.postService
      .getComentariosByPostId(this.post.id)
      .subscribe((response: any) => {
        this.comentarios = response;
      });
  }

  eliminarComentario(comentario: any): void {
    console.log(comentario);
  }

  addEmoji(event: any): void {
    const comentario = this.formGroup.value.contenido;

    this.formGroup.patchValue({
      contenido: `${comentario}${event.emoji.native}`,
    });
  }

  emojiBottomSheet(): void {
    // displayEmojis = !displayEmojis
    const ref = this.bottomSheet.open(BottomSheetsEmojisComponent, {
      closeOnNavigation: true
    });

    ref.afterDismissed().subscribe((value: any) => {
      if (value) {
        this.addEmoji(value);
      }
    });
  }
}

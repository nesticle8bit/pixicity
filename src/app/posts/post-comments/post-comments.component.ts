import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss']
})
export class PostCommentsComponent implements OnInit {
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

  constructor(
    private formBuilder: FormBuilder,
    private postService: IHttpPostsService,
    private securityService: IHttpSecurityService
  ) {
    this.formGroup = this.formBuilder.group({
      contenido: ['', Validators.required]
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
          contenido: ''
        });

        this.comentarios.push({
          id: response,
          userName: this.currentUser.usuario.userName,
          contenido: comentario.contenido,
          fechaComentario: new Date()
        });
      }
    });
  }

  getComentariosByPostId(): void {
    this.postService.getComentariosByPostId(this.post.id).subscribe((response: any) => {
      if (response) {
        response = response.map((comentario: any) => {
          comentario.actions = false;
          return comentario;
        });
      }

      this.comentarios = response;
    });
  }

  eliminarComentario(comentario: any): void {
    console.log(comentario);
  }
}

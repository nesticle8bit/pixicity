import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-posts-view',
  templateUrl: './posts-view.component.html',
  styleUrls: ['./posts-view.component.scss']
})
export class PostsViewComponent implements OnInit {
  public formGroup: FormGroup;
  public postId: number = 0;
  public post: any;
  public usuario: any;
  public comentarios: any;
  public show: boolean = false;
  public loggedUser: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: IHttpPostsService,
    private formBuilder: FormBuilder,
    private securityService: IHttpSecurityService
  ) {
    this.formGroup = this.formBuilder.group({
      contenido: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((values: any) => {
      this.postId = values.get('id');

      this.getPostById();
      this.getComentariosByPostId();
    });

    this.loggedUser = this.securityService.getCurrentUser();
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
      if (response) {
        response = response.map((comentario: any) => {
          comentario.actions = false;
          return comentario;
        });
      }

      this.comentarios = response;
    });
  }

  enviarComentario(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const comentario = Object.assign({}, this.formGroup.value);
    comentario.postId = +this.postId;

    this.postService.addComentario(comentario).subscribe((response: any) => {
      if (response) {
        this.formGroup.patchValue({
          contenido: ''
        });

        this.comentarios.push({
          id: response,
          userName: this.loggedUser.usuario.userName,
          contenido: comentario.contenido,
          fechaComentario: new Date()
        });
      }
    });
  }
}

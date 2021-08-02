import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-posts-view',
  templateUrl: './posts-view.component.html',
  styleUrls: ['./posts-view.component.scss']
})
export class PostsViewComponent implements OnInit {
  public formGroup: FormGroup;
  public activatedPost = {
    postId: 0,
    postNombre: ''
  };
  public post: any;
  public usuario: any;
  public comentarios: any;
  public show: boolean = false;
  public currentUser: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: IHttpPostsService,
    private formBuilder: FormBuilder,
    private securityService: IHttpSecurityService,
    private router: Router
  ) {
    this.formGroup = this.formBuilder.group({
      contenido: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((values: any) => {
      this.activatedPost = {
        postId: +values.get('id'),
        postNombre: values.get('nombre-post')
      }

      this.getPostById();
      this.getComentariosByPostId();
    });

    this.currentUser = this.securityService.getCurrentUser();
    console.log(this.currentUser);
  }

  getPostById(): void {
    this.postService.getPostById(this.activatedPost.postId).subscribe((value: any) => {
      if (!value) {
        this.router.navigate([`/posts/404/${this.activatedPost.postNombre}`]);
        return;
      }

      if (value.post) {
        value.post.tags = value.post.etiquetas.split(',')
      }

      this.post = value.post;
      this.usuario = value.usuario;
    });
  }

  getComentariosByPostId(): void {
    this.postService.getComentariosByPostId(this.activatedPost.postId).subscribe((response: any) => {
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
    comentario.postId = this.activatedPost.postId;

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

  actualizarPost(): void {
    this.router.navigate([`posts/actualizar/${this.activatedPost.postId}`]);
  }

  eliminarPost(): void {
    Swal.fire({
      title: 'Borrar Post',
      text: '¿Seguro que deseas borrar este post?',
      showCancelButton: true,
      confirmButtonText: `Borrar`,
      cancelButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService.deletePost(this.activatedPost.postId).subscribe((response: boolean) => {
          if (response) {
            Swal.fire({
              title: 'Eliminado',
              text: 'El post ha sido eliminado correctamente, ahora nadie lo podrá visualizar',
              icon: 'success',
              timer: 3000
            }).then(() => {
              this.router.navigate(['']);
            });
          }
        });
      }
    })
  }
}

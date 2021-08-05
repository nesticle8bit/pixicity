import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-posts-view',
  templateUrl: './posts-view.component.html',
  styleUrls: ['./posts-view.component.scss']
})
export class PostsViewComponent implements OnInit {
  public currentUser: any;
  public post: any;
  public usuario: any;
  public show: boolean = false;
  public availablePuntos: number[] = [];
  public addedPuntos: boolean = false;

  constructor(
    private securityService: IHttpSecurityService,
    private activatedRoute: ActivatedRoute,
    private postService: IHttpPostsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((values: any) => {
      this.getPostById(+values.get('id'));
      this.getAvailablePuntos();
    });

    this.currentUser = this.securityService.getCurrentUser();
  }

  getPostById(postId: number): void {
    this.postService.getPostById(postId).subscribe((value: any) => {
      if (!value) {
        this.router.navigate([`/posts/404/${this.post.titulo}`]);
        return;
      }

      if (value.post) {
        value.post.url = value.post.titulo.toLowerCase().replace(/\s/g, '-');
        value.post.tags = value.post.etiquetas.split(',')
      }

      this.post = value.post;
      this.post.id = postId;

      this.usuario = value.usuario;
    });
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

  actualizarPost(): void {
    this.router.navigate([`posts/actualizar/${this.post.id}`]);
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
        this.postService.deletePost(this.post.id).subscribe((response: boolean) => {
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

  quitarSticky(): void {
    this.postService.changeStickyPost(this.post.id).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Sticky',
          text: 'Se ha cambiado el sticky para este post correctamente',
          icon: 'success',
          timer: 3000
        });

        this.post.sticky = !this.post.sticky;
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

  nextPost(postId: number): void {
    console.log(postId);
  }

  prevPost(postId: number): void {
    console.log(postId);
  }

  randomPost(): void {

  }
}

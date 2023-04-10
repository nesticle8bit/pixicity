import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { SEOModel } from 'src/app/models/shared/seo.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { SEOService } from 'src/app/services/shared/seo.service';

@Component({
  selector: 'app-posts-view',
  templateUrl: './posts-view.component.html',
  styleUrls: ['./posts-view.component.scss'],
})
export class PostsViewComponent implements OnInit {
  public seo: SEOModel = {
    title: '',
    description: '',
    type: '',
    imageURL: '',
    tags: [],
  };
  public currentUser: any;
  public post: any;
  public show: boolean = false;

  constructor(
    private securityService: IHttpSecurityService,
    private activatedRoute: ActivatedRoute,
    private postService: IHttpPostsService,
    private displayService: DisplayComponentService,
    private seoService: SEOService,
    private router: Router
  ) {
    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((values: any) => {
      this.getPostById(+values.get('id'));
      this.post = {
        titulo: values.get('nombre-post'),
      };
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: true,
      background: '',
    });
  }

  getPostById(postId: number): void {
    this.postService.getPostById(postId).subscribe((value: any) => {
      if (!value) {
        this.router.navigate([`/posts/404/${this.post.titulo}`]);
        return;
      }

      if (value.post.esPrivado && !value.post.id) {
        this.router.navigate([`/posts/privado/${this.post.titulo}`]);
        return;
      }

      if (value.post) {
        value.post.tags = value.post.etiquetas.split(',');
      }

      this.post = value.post;
      this.post.id = postId;

      this.seoService.setSEO({
        title: value.post.titulo,
        description: value.post.titulo,
        tags: value.post.tags,
        type: value.post.categoria.nombre,
        imageURL: '',
      });
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
      icon: 'question',
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService
          .deletePost(this.post.id, '')
          .subscribe((response: boolean) => {
            if (response) {
              Swal.fire({
                title: 'Eliminado',
                text: 'El post ha sido eliminado correctamente, ahora nadie lo podrá visualizar',
                icon: 'success',
                timer: 3000,
              }).then(() => {
                this.router.navigate(['']);
              });
            }
          });
      }
    });
  }

  quitarSticky(): void {
    this.postService
      .changeStickyPost(this.post.id)
      .subscribe((response: any) => {
        if (response) {
          Swal.fire({
            title: 'Sticky',
            text: 'Se ha cambiado el sticky para este post correctamente',
            icon: 'success',
            timer: 3000,
          });

          this.post.sticky = !this.post.sticky;
        }
      });
  }
}

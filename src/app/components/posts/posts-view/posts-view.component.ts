import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { SEOModel } from 'src/app/models/shared/seo.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';

@Component({
  standalone: false,
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
    private router: Router,
    private notificationService: NotificationService
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

      const description = value.post.contenido
        ? value.post.contenido.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 160)
        : value.post.titulo;

      this.seoService.setSEO({
        title: value.post.titulo,
        description,
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
    if (!this.notificationService.confirm('¿Seguro que deseas borrar este post?')) {
      return;
    }

    this.postService
      .deletePost(this.post.id, '')
      .subscribe((response: boolean) => {
        if (response) {
          this.notificationService.success('El post ha sido eliminado correctamente, ahora nadie lo podrá visualizar', 'Eliminado');
          this.router.navigate(['']);
        }
      });
  }

  openShare(network: string): void {
    const url = encodeURIComponent(window.location.href);
    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(this.post?.titulo || '')}`,
    };
    if (urls[network]) {
      window.open(urls[network], '_blank', 'width=640,height=480,scrollbars=yes');
    }
  }

  quitarSticky(): void {
    this.postService
      .changeStickyPost(this.post.id)
      .subscribe((response: any) => {
        if (response) {
          this.notificationService.success('Se ha cambiado el sticky para este post correctamente', 'Sticky');
          this.post.sticky = !this.post.sticky;
        }
      });
  }
}

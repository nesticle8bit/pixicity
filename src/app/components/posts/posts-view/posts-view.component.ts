import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { SEOModel } from 'src/app/models/shared/seo.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';

@Component({
  standalone: false,
  selector: 'app-posts-view',
  templateUrl: './posts-view.component.html',
  styleUrls: ['./posts-view.component.scss'],
})
export class PostsViewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.getPostById(+(values.get('id') ?? 0));
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
    this.postService.getPostById(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
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

      const imagen = this.primeraImagen(value.post.contenido);

      // El post se carga solo por id: /posts/lo-que-sea/123/cualquier-cosa
      // devuelve el mismo contenido. Sin una ruta canonica fija, cualquiera
      // puede generar duplicados ilimitados enlazando mal.
      const rutaCanonica = this.router
        .createUrlTree(['/posts', value.post.categoria?.seo, postId, value.post.url])
        .toString();
      const canonical = `${location.origin}${rutaCanonica}`;

      if (this.rutaDistinta(rutaCanonica)) {
        this.router.navigateByUrl(rutaCanonica, { replaceUrl: true });
        return;
      }

      this.seoService.setSEO({
        title: value.post.titulo,
        description,
        tags: value.post.tags ?? [],
        // og:type solo acepta valores del vocabulario Open Graph, no la categoria.
        type: 'article',
        imageURL: imagen,
        canonical,
        publishedTime: value.post.fechaRegistro,
        modifiedTime: value.post.fechaActualiza ?? value.post.fechaRegistro,
        author: value.post.usuario?.userName,
        section: value.post.categoria?.nombre,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [{
          '@type': 'Article',
          headline: value.post.titulo,
          description,
          articleSection: value.post.categoria?.nombre,
          keywords: (value.post.tags ?? []).join(', '),
          datePublished: value.post.fechaRegistro,
          dateModified: value.post.fechaActualiza ?? value.post.fechaRegistro,
          image: imagen ? [imagen] : undefined,
          author: {
            '@type': 'Person',
            name: value.post.usuario?.userName ?? 'Taringa!',
            url: value.post.usuario?.userName
              ? `${location.origin}/perfil/${value.post.usuario.userName}`
              : undefined,
          },
          publisher: { '@id': `${location.origin}/#organization` },
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          commentCount: value.post.cantidadComentarios ?? undefined,
          comment: this.comentariosJsonLd(value.post),
        }, this.breadcrumb(value.post, canonical)],
        },
      });
    });
  }

  /** Compara la ruta visitada con la canonica, sin que la codificacion moleste. */
  private rutaDistinta(rutaCanonica: string): boolean {
    const actual = decodeURIComponent(location.pathname);
    const esperada = decodeURIComponent(rutaCanonica.split('?')[0]);

    return actual !== esperada;
  }

  /**
   * Los comentarios son el contenido diferencial del post; sin esto Google
   * no ve que la pagina tiene debate. Se acotan para no inflar el HTML.
   */
  private comentariosJsonLd(post: any): any[] | undefined {
    const comentarios: any[] = post.comentarios ?? [];
    if (!comentarios.length) {
      return undefined;
    }

    return comentarios.slice(0, 10).map((c) => ({
      '@type': 'Comment',
      text: (c.contenido || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500),
      dateCreated: c.fechaComentario ?? c.fechaRegistro,
      author: { '@type': 'Person', name: c.usuario?.userName ?? 'Anónimo' },
    }));
  }

  /** Migas Inicio > Categoria > Post: Google las muestra en lugar de la URL cruda. */
  private breadcrumb(post: any, canonical: string): any {
    return {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Taringa!', item: `${location.origin}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: post.categoria?.nombre,
          item: `${location.origin}/posts/${post.categoria?.seo}`,
        },
        { '@type': 'ListItem', position: 3, name: post.titulo, item: canonical },
      ],
    };
  }

  /** Primera imagen del contenido: sirve como og:image y como image del JSON-LD. */
  private primeraImagen(contenido: string): string {
    const match = /<img[^>]+src=["']([^"']+)["']/i.exec(contenido ?? '');
    if (!match) {
      return '';
    }

    const src = match[1];
    return src.startsWith('http') ? src : `${location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
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
      .pipe(takeUntilDestroyed(this.destroyRef))
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          this.notificationService.success('Se ha cambiado el sticky para este post correctamente', 'Sticky');
          this.post.sticky = !this.post.sticky;
        }
      });
  }
}

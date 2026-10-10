import { environment } from 'src/environments/environment';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { SEOModel } from 'src/app/models/shared/seo.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { PostDetalle } from 'src/app/models/posts/post-vm.model';
import { UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { DecimalPipe, DatePipe, DOCUMENT } from '@angular/common';
import { FollowButtonComponent } from '../../addons/follow-button/follow-button.component';
import { PostMoreFromOPComponent } from '../post-more-from-op/post-more-from-op.component';
import { PostRelatedPostsComponent } from '../post-related-posts/post-related-posts.component';
import { PostsBreadcrumbComponent } from '../posts-breadcrumb/posts-breadcrumb.component';
import { PostsNavComponent } from '../posts-nav/posts-nav.component';
import { ShareButtonsComponent } from '../../addons/share-buttons/share-buttons.component';
import { PostsTagsComponent } from '../posts-tags/posts-tags.component';
import { PostsMetaComponent } from '../posts-meta/posts-meta.component';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';
import { PostCommentsComponent } from '../post-comments/post-comments.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { ContenidoSeoPipe } from '../../../shared/pipes/contenidoSeo.pipe';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

@Component({
    selector: 'app-posts-view',
    templateUrl: './posts-view.component.html',
    styleUrls: ['./posts-view.component.scss'],
    imports: [
        RouterLink,
        UserPopoverDirective,
        UserAvatarComponent,
        FollowButtonComponent,
        PostMoreFromOPComponent,
        PostRelatedPostsComponent,
        PostsBreadcrumbComponent,
        PostsNavComponent,
        ShareButtonsComponent,
        PostsTagsComponent,
        PostsMetaComponent,
        AdsByTypeComponent,
        PostCommentsComponent,
        DecimalPipe,
        DatePipe,
        TimeAgoPipe,
        ContenidoSeoPipe,
    ],
})
export class PostsViewComponent implements OnInit {
  private readonly documento = inject(DOCUMENT);
  private securityService = inject(IHttpSecurityService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private activatedRoute = inject(ActivatedRoute);
  private postService = inject(IHttpPostsService);
  private displayService = inject(DisplayComponentService);
  private seoService = inject(SEOService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public seo: SEOModel = {
    title: '',
    description: '',
    type: '',
    imageURL: '',
    tags: [],
  };
  public currentUser: JwtUserModel;
  public post: PostDetalle | null = null;
  public autor: UsuarioInfoViewModel | null = null;
  public show: boolean = false;

  /** Slug del título en la URL: se usa para redirigir a /posts/404 o /posts/privado antes de tener el post. */
  private tituloRuta = '';

  get esAutor(): boolean {
    return !!this.currentUser?.usuario && this.post?.usuario?.userName === this.currentUser.usuario?.userName;
  }

  get esStaff(): boolean {
    const rango = this.currentUser?.usuario?.rango;
    return rango === 'Administrador' || rango === 'Moderador';
  }

  constructor() {
    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.tituloRuta = values.get('nombre-post') ?? '';
      this.getPostById(+(values.get('id') ?? 0));
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
        this.router.navigate([`/posts/404/${this.tituloRuta}`], { replaceUrl: true });
        return;
      }

      if (value.post.esPrivado && !value.post.id) {
        this.router.navigate([`/posts/privado/${this.tituloRuta}`], {
          replaceUrl: true,
          queryParams: { volver: this.documento.location.pathname },
        });
        return;
      }

      value.post.tags = value.post.etiquetas ? value.post.etiquetas.split(',') : [];

      this.post = { ...value.post, id: postId };
      this.getAutor(value.post.usuario?.userName);

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
      const canonical = `${environment.publicUrl}${rutaCanonica}`;

      if (this.rutaDistinta(rutaCanonica)) {
        // Conserva el #comentario-{id} de las notificaciones al corregir la URL.
        this.router.navigateByUrl(rutaCanonica + this.documento.location.hash, { replaceUrl: true });
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
              ? `${environment.publicUrl}/perfil/${value.post.usuario.userName}`
              : undefined,
          },
          publisher: { '@id': `${environment.publicUrl}/#organization` },
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          commentCount: value.post.cantidadComentarios,
        }, this.breadcrumb(value.post, canonical)],
        },
      });
    });
  }

  private getAutor(userName: string): void {
    if (!userName || this.autor?.userName === userName) {
      return;
    }

    this.usuarioPerfilService.getUsuarioInfo(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((info) => {
      this.autor = info;
    });
  }

  /** Compara la ruta visitada con la canonica, sin que la codificacion moleste. */
  private rutaDistinta(rutaCanonica: string): boolean {
    const actual = decodeURIComponent(this.documento.location.pathname);
    const esperada = decodeURIComponent(rutaCanonica.split('?')[0]);

    return actual !== esperada;
  }

  /** Migas Inicio > Categoria > Post: Google las muestra en lugar de la URL cruda. */
  private breadcrumb(post: PostDetalle, canonical: string): object {
    return {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Taringa!', item: `${environment.publicUrl}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: post.categoria?.nombre,
          item: `${environment.publicUrl}/posts/${post.categoria?.seo}`,
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
    return src.startsWith('http') ? src : `${environment.publicUrl}${src.startsWith('/') ? '' : '/'}${src}`;
  }

  actualizarPost(): void {
    if (this.post) {
      this.router.navigate([`posts/actualizar/${this.post.id}`]);
    }
  }

  eliminarPost(): void {
    if (!this.post || !this.notificationService.confirm('¿Seguro que deseas borrar este post?')) {
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

  quitarSticky(): void {
    const post = this.post;
    if (!post) {
      return;
    }

    this.postService
      .changeStickyPost(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          this.notificationService.success('Se ha cambiado el sticky para este post correctamente', 'Sticky');
          post.sticky = !post.sticky;
        }
      });
  }
}

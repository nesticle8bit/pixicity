import { environment } from 'src/environments/environment';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { TemaComentario, TemaDetalle } from 'src/app/models/comunidades/comunidad.model';
import { idUsuarioSesion, JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { ComentarioHilo, ComentariosAcciones } from 'src/app/models/shared/comentario-hilo.model';
import { UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { DecimalPipe, DatePipe, DOCUMENT } from '@angular/common';
import { FollowButtonComponent } from '../../addons/follow-button/follow-button.component';
import { ShareButtonsComponent } from '../../addons/share-buttons/share-buttons.component';
import { MatTooltip } from '@angular/material/tooltip';
import { ComentariosComponent } from '../../shared/comentarios/comentarios.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { ContenidoSeoPipe } from '../../../shared/pipes/contenidoSeo.pipe';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

type TemaVista = TemaDetalle & { _votando?: boolean };

/** Convierte un comentario de tema al formato común de <app-comentarios>. */
function aHilo(c: TemaComentario): ComentarioHilo {
  return {
    id: c.id,
    parentId: c.parentId,
    contenido: c.contenido,
    fecha: c.fechaComentario,
    fechaEdicion: c.fechaActualiza,
    userName: c.userName ?? '',
    avatar: c.avatar,
    rango: c.rango,
    votos: c.votos,
    miVoto: c.miVoto,
    votosArriba: c.votosArriba,
    votosAbajo: c.votosAbajo,
    fijado: c.fijado,
    denunciasPendientes: c.denunciasPendientes,
  };
}

@Component({
    selector: 'app-comunidad-tema-view',
    templateUrl: './comunidad-tema-view.component.html',
    styleUrls: ['./comunidad-tema-view.component.scss'],
    imports: [
        RouterLink,
        UserPopoverDirective,
        UserAvatarComponent,
        FollowButtonComponent,
        ShareButtonsComponent,
        MatTooltip,
        ComentariosComponent,
        DecimalPipe,
        DatePipe,
        TimeAgoPipe,
        ContenidoSeoPipe,
    ],
})
export class ComunidadTemaViewComponent implements OnInit {
  private readonly documento = inject(DOCUMENT);
  private displayService = inject(DisplayComponentService);
  private comunidadesService = inject(IHttpComunidadesService);
  private securityService = inject(IHttpSecurityService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private seoService = inject(SEOService);

  private readonly destroyRef = inject(DestroyRef);

  public tema: TemaVista | null = null;
  public autor: UsuarioInfoViewModel | null = null;
  public comentarios: ComentarioHilo[] = [];
  public totalComentarios = 0;
  public currentUser: JwtUserModel | null = null;
  public loading: boolean = true;
  public slug: string = '';

  /** Llamadas al API de comunidades que usa la sección de comentarios. */
  public readonly accionesComentarios: ComentariosAcciones = {
    comentar: (contenido, parentId) =>
      this.comunidadesService.addTemaComentario({ comunidadTemaId: this.tema!.id, contenido, parentId }),
    editar: (id, contenido) => this.comunidadesService.editarComentario(id, contenido),
    eliminar: (id) => this.comunidadesService.eliminarComentario(id),
    votar: (id, valor) => this.comunidadesService.votarComentario(id, valor),
    fijar: (id) => this.comunidadesService.fijarComentario(id),
    denunciar: (id, motivo) => this.comunidadesService.denunciarComentario(id, motivo),
  };

  constructor() {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.slug = params['slug'];
      const id = +params['id'];
      this.cargar(id);
    });
  }

  cargar(id: number): void {
    this.loading = true;
    this.comunidadesService.getTema(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value) => {
        const tema: TemaVista = { ...value, comentarios: value.comentarios ?? [] };
        this.tema = tema;
        this.comentarios = tema.comentarios.map(aHilo);
        this.totalComentarios = this.comentarios.length;
        this.loading = false;
        this.cargarAutor(tema.userName);

        const rutaCanonica = this.router
          .createUrlTree(['/comunidades', tema.comunidad?.nombreCorto, 'tema', tema.id, tema.url])
          .toString();

        if (decodeURIComponent(this.documento.location.pathname) !== decodeURIComponent(rutaCanonica.split('?')[0])) {
          // Mismo problema que en posts: el tema se resuelve por id.
          this.router.navigateByUrl(rutaCanonica, { replaceUrl: true });
          return;
        }

        const limpio = (tema.contenido || '').replace(/<[^>]*>/g, '').trim();
        const imagen = /<img[^>]+src=["']([^"']+)["']/i.exec(tema.contenido ?? '')?.[1] ?? '';
        this.seoService.setSEO({
          title: tema.titulo,
          description: limpio ? limpio.substring(0, 200) : `${tema.titulo} - Tema en la comunidad ${tema.comunidad?.nombre ?? ''} de Taringa.`,
          type: 'article',
          imageURL: imagen,
          tags: [tema.titulo, tema.comunidad?.nombre, 'comunidad', 'taringas'].filter((t): t is string => !!t),
          canonical: `${environment.publicUrl}${rutaCanonica}`,
          publishedTime: tema.fechaRegistro,
          modifiedTime: tema.fechaRegistro,
          author: tema.userName ?? undefined,
          section: tema.comunidad?.nombre,
          jsonLd: {
            '@context': 'https://schema.org',
            '@graph': [{
            '@type': 'DiscussionForumPosting',
            headline: tema.titulo,
            text: limpio ? limpio.substring(0, 500) : undefined,
            datePublished: tema.fechaRegistro,
            image: imagen || undefined,
            author: {
              '@type': 'Person',
              name: tema.userName ?? 'Taringa!',
            },
            publisher: { '@id': `${environment.publicUrl}/#organization` },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${environment.publicUrl}${this.documento.location.pathname}` },
            commentCount: tema.comentarios.length,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${environment.publicUrl}/#website`,
              name: tema.comunidad?.nombre,
            },
          }, {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Taringa!', item: `${environment.publicUrl}/` },
              { '@type': 'ListItem', position: 2, name: 'Comunidades', item: `${environment.publicUrl}/comunidades` },
              {
                '@type': 'ListItem',
                position: 3,
                name: tema.comunidad?.nombre,
                item: `${environment.publicUrl}/comunidades/${tema.comunidad?.nombreCorto ?? ''}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: tema.titulo,
                item: `${environment.publicUrl}${this.documento.location.pathname}`,
              },
            ],
          }],
          },
        });
      },
      error: () => {
        this.loading = false;
        this.seoService.setSEO({
          title: 'Tema no encontrado',
          description: 'Este tema no existe o fue eliminado.',
          type: 'website',
          imageURL: '',
          tags: [],
          noIndex: true,
          statusCode: 404,
        });
      },
    });
  }

  /** Puntos, posts, seguidores y rango del autor para la tarjeta lateral (igual que en posts). */
  private cargarAutor(userName: string | null): void {
    if (!userName || this.autor?.userName === userName) {
      return;
    }

    this.usuarioPerfilService
      .getUsuarioInfo(userName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((info) => (this.autor = info ?? null));
  }

  // - Permisos

  get esMio(): boolean {
    return !!this.currentUser?.usuario?.userName && this.currentUser.usuario.userName === this.tema?.userName;
  }

  get esAdmin(): boolean {
    const rango = this.currentUser?.usuario?.rango;
    return rango === 'Administrador' || rango === 'Moderador';
  }

  get puedeGestionar(): boolean {
    return this.esMio || this.esAdmin;
  }

  /** Mods/admins o el dueño de la comunidad (el id de la sesión viene en base64). */
  get esDuenoComunidad(): boolean {
    const miId = idUsuarioSesion(this.currentUser?.usuario);
    return miId !== null && this.tema?.comunidad?.usuarioId === miId;
  }

  // - Tema

  eliminar(): void {
    const tema = this.tema;
    if (!tema || !confirm('¿Eliminar este tema? Esta acción no se puede deshacer.')) return;

    this.comunidadesService.deleteTema(tema.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('El tema ha sido eliminado', 'Tema eliminado');
        this.router.navigate(['/comunidades', this.slug]);
      },
      error: () => {},
    });
  }

  cambiarSticky(): void {
    const tema = this.tema;
    if (!tema) return;

    this.comunidadesService.changeStickyTema(tema.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value) => {
        tema.sticky = value;
        this.notificationService.success('Se ha cambiado el sticky de este tema correctamente', 'Sticky');
      },
      error: () => {},
    });
  }

  votarTema(valor: number): void {
    if (!this.currentUser?.usuario) {
      this.notificationService.warning('Inicia sesión para votar', 'Comunidades');
      return;
    }
    const tema = this.tema;
    if (!tema || tema._votando) return;

    tema._votando = true;
    this.comunidadesService.votarTema(tema.id, valor).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        tema.votos = res?.total ?? tema.votos ?? 0;
        tema.miVoto = res?.miVoto ?? 0;
        tema._votando = false;
      },
      error: () => { tema._votando = false; },
    });
  }
}

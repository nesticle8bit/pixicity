import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { environment } from 'src/environments/environment';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ShoutInteracciones, ShoutReaccion } from 'src/app/models/perfil/shout-vm.model';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { SesionRequeridaService } from 'src/app/services/shared/sesion-requerida.service';
import { UserPopoverDirective } from '../../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';
import { MatTooltip } from '@angular/material/tooltip';
import { ShoutMediaComponent } from '../../../addons/shout-media/shout-media.component';
import { ShoutsCommentsComponent } from '../shouts-comments/shouts-comments.component';
import { PostOriginalPosterInfoComponent } from '../../../posts/post-original-poster-info/post-original-poster-info.component';
import { MatButton } from '@angular/material/button';
import { DatePipe, DOCUMENT } from '@angular/common';
import { TextoEnlazadoComponent } from '../../../shared/shouts/texto-enlazado/texto-enlazado.component';

type Marca = 'meGusta' | 'favorito' | 'reshouteado';

const SIN_SESION: Record<Marca, string> = {
  meGusta: 'Inicia sesión para dar me gusta',
  favorito: 'Inicia sesión para guardar en favoritos',
  reshouteado: 'Inicia sesión para compartir',
};

@Component({
  selector: 'app-shouts-view',
  templateUrl: './shouts-view.component.html',
  styleUrls: ['./shouts-view.component.scss'],
  imports: [
    RouterLink,
    UserPopoverDirective,
    UserAvatarComponent,
    MatTooltip,
    ShoutMediaComponent,
    ShoutsCommentsComponent,
    PostOriginalPosterInfoComponent,
    MatButton,
    DatePipe,
    TextoEnlazadoComponent,
  ],
})
export class ShoutsViewComponent implements OnInit {
  private readonly documento = inject(DOCUMENT);
  private displayService = inject(DisplayComponentService);
  private securityService = inject(IHttpSecurityService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private perfilService = inject(IHttpPerfilService);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(NotificationService);
  private seoService = inject(SEOService);
  private sesion = inject(SesionRequeridaService);

  public readonly publicUrl = environment.publicUrl;

  private readonly destroyRef = inject(DestroyRef);

  public currentUser?: JwtUserModel;
  public shout: any;

  readonly interacciones = signal<ShoutInteracciones>({
    meGustas: 0,
    favoritos: 0,
    meGusta: false,
    favorito: false,
    reshouts: 0,
    reshouteado: false,
  });
  /** "Compartido por": los últimos que lo compartieron en su muro. */
  readonly compartidoPor = signal<{ usuarios: { userName: string; avatar: string | null }[]; total: number }>({
    usuarios: [],
    total: 0,
  });
  /** Un pedido a la vez: un segundo clic antes de la respuesta desharía el primero. */
  readonly enviando = signal<Marca | null>(null);

  constructor() {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: false,
      background: '',
    });

    this.getParameters();
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  getParameters(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paramsMap) => {
        this.getCurrentShout(+(paramsMap.get('id') ?? 0));
      });
  }

  getCurrentShout(shoutId: number): void {
    if (!shoutId) {
      return;
    }

    this.perfilService
      .getShoutById(shoutId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.shout = value;

        if (this.shout) {
          this.perfilService
            .getShoutInteracciones(shoutId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((i) => {
              this.interacciones.set(i);
              this.aplicarSEO();
            });
          this.cargarCompartidoPor(shoutId);

          this.aplicarSEO();
        }

        if (!this.shout) {
          this.router.navigate(['/mi'], { replaceUrl: true });
        }
      });
  }

  /** Título, descripción, imagen y JSON-LD a partir del texto real del shout (lo que lee Google vía SSR). */
  private aplicarSEO(): void {
    const s = this.shout;
    const autor: string = s.avatar?.userName ?? '';
    const texto = (s.comentario || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const hashtags: string[] = Array.from(new Set<string>((texto.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((t: string) => t.slice(1).toLowerCase())));
    const recorte = (t: string, max: number) => (t.length > max ? t.substring(0, max - 1).trimEnd() + '…' : t);
    const url = `${environment.publicUrl}/shouts/${encodeURIComponent(autor)}/${s.id}`;
    const imagen: string = s.mediaImagen || (s.tipo === 'Foto' || /\.(jpe?g|png|gif|webp)(\?|$)/i.test(s.url ?? '') ? s.url : '') || '';
    const titulo = texto ? `${recorte(texto, 60)} · @${autor}` : `Shout de @${autor}`;
    const descripcion = texto
      ? recorte(texto, 160)
      : s.mediaTitulo
        ? `@${autor} compartió: ${recorte(s.mediaTitulo, 120)}`
        : `Shout de @${autor} en Taringas.`;

    // Shout de una línea, sin imagen ni enlace ni respuestas: no aporta en Google y resta calidad al sitio.
    const pobre = texto.length < 40 && !imagen && !s.url && !(s.comentarios ?? 0);

    this.seoService.setSEO({
      title: titulo,
      description: descripcion,
      type: 'article',
      noIndex: pobre,
      imageURL: imagen,
      tags: [autor, 'shout', ...hashtags].filter(Boolean),
      canonical: url,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SocialMediaPosting',
        '@id': url,
        url,
        headline: recorte(texto || `Shout de @${autor}`, 110),
        articleBody: texto || undefined,
        datePublished: s.fechaRegistro,
        dateModified: s.fechaActualiza || s.fechaRegistro,
        image: imagen || undefined,
        keywords: hashtags.length ? hashtags.join(', ') : undefined,
        author: { '@type': 'Person', name: autor, url: `${environment.publicUrl}/perfil/${encodeURIComponent(autor)}` },
        publisher: { '@id': `${environment.publicUrl}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        interactionStatistic: [
          { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: this.interacciones().meGustas },
          { '@type': 'InteractionCounter', interactionType: 'https://schema.org/ShareAction', userInteractionCount: this.interacciones().reshouts },
        ],
      },
    });
  }

  alternarMeGusta(): void {
    this.alternar('meGusta', 'meGustas', (id) => this.perfilService.alternarMeGustaShout(id));
  }

  alternarFavorito(): void {
    this.alternar('favorito', 'favoritos', (id) => this.perfilService.alternarFavoritoShout(id));
  }

  alternarReshout(): void {
    this.alternar('reshouteado', 'reshouts', (id) => this.perfilService.alternarReshoutShout(id), () =>
      this.cargarCompartidoPor(this.shout.id),
    );
  }

  get esMio(): boolean {
    return !!this.currentUser?.usuario && this.shout?.avatar?.userName === this.currentUser.usuario.userName;
  }

  private cargarCompartidoPor(shoutId: number): void {
    this.perfilService
      .getReshouts(shoutId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.compartidoPor.set(r));
  }

  /** Cambia el botón al instante; si el API falla vuelve al estado anterior. */
  private alternar(
    marca: Marca,
    total: 'meGustas' | 'favoritos' | 'reshouts',
    pedido: (shoutId: number) => Observable<ShoutReaccion>,
    alTerminar?: () => void,
  ): void {
    if (!this.sesion.exigir(SIN_SESION[marca])) return;
    if (this.enviando()) return;

    const antes = this.interacciones();
    const activo = !antes[marca];
    this.interacciones.set({ ...antes, [marca]: activo, [total]: Math.max(0, (antes[total] ?? 0) + (activo ? 1 : -1)) });
    this.enviando.set(marca);

    pedido(this.shout.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r) => {
        this.interacciones.update((i) => ({ ...i, [marca]: r.activo, [total]: r.total }));
        this.enviando.set(null);
        alTerminar?.();
      },
      error: () => {
        this.interacciones.set(antes);
        this.enviando.set(null);
      },
    });
  }

  irAComentar(): void {
    const campo = this.documento.querySelector<HTMLTextAreaElement>('#shout-comentarios textarea');
    if (campo) {
      campo.focus({ preventScroll: true });
      campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      this.documento.getElementById('shout-comentarios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async eliminarShout(): Promise<void> {
    if (
      !await this.notificationService.confirm(
        '¿Seguro que deseas eliminar este shout?',
      )
    ) {
      return;
    }

    this.perfilService
      .deleteShout(this.shout.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          this.notificationService.success(
            'El shout ha sido eliminado exitosamente',
            'Eliminado',
          );
          window.location.href = '';
        }
      });
  }

  clipboard(text: string): void {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.snackBar.open('Texto copiado al portapapeles', '', {
      duration: 3 * 1000,
    });
  }
}

import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { environment } from 'src/environments/environment';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ShoutInteracciones, ShoutReaccion } from 'src/app/models/perfil/shout-vm.model';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
            .subscribe((i) => this.interacciones.set(i));
          this.cargarCompartidoPor(shoutId);

          const texto = (this.shout.contenido || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          const autor = this.shout.usuario?.userName ?? '';

          this.seoService.setSEO({
            title: texto ? texto.substring(0, 60) : `Shout de ${autor}`,
            description: texto
              ? texto.substring(0, 200)
              : `Shout de ${autor} en Taringa.`,
            type: 'article',
            imageURL: '',
            tags: [autor, 'shout', 'taringas'].filter(Boolean),
            canonical: `${environment.publicUrl}${this.documento.location.pathname}`,
            jsonLd: {
              '@context': 'https://schema.org',
              '@type': 'SocialMediaPosting',
              headline: texto ? texto.substring(0, 110) : `Shout de ${autor}`,
              datePublished: this.shout.fechaRegistro,
              author: { '@type': 'Person', name: autor },
              publisher: { '@id': `${environment.publicUrl}/#organization` },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${environment.publicUrl}${this.documento.location.pathname}`,
              },
            },
          });
        }

        if (!this.shout) {
          window.location.href = '';
        }
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

  eliminarShout(): void {
    if (
      !this.notificationService.confirm(
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

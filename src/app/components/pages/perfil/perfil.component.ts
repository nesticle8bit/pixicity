import { Subscription } from 'rxjs';
import {
  PERFIL_VACIO,
  PerfilUsuarioViewModel,
} from 'src/app/models/seguridad/seguridad-vm.model';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { environment } from 'src/environments/environment';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpBloqueosService } from 'src/app/services/interfaces/httpBloqueos.interface';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { BloqueoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { ArrastrarFondoDirective, PosicionFondo } from 'src/app/shared/directives/arrastrar-fondo.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { sumarContexto } from 'src/app/services/shared/seo-title.strategy';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { GenreIconComponent } from '../../addons/genre-icon/genre-icon.component';
import { CountryFlagComponent } from '../../addons/country-flag/country-flag.component';
import { MatTooltip } from '@angular/material/tooltip';
import { FollowButtonComponent } from '../../addons/follow-button/follow-button.component';
import { SendMessageButtonComponent } from '../../addons/send-message-button/send-message-button.component';
import { BanearUsuarioComponent } from '../../admin/usuarios/usuarios/banear-usuario/banear-usuario.component';
import { ChangeRangoComponent } from '../../admin/usuarios/rangos/change-rango/change-rango.component';
import { ChangeAvatarComponent } from '../../admin/usuarios/usuarios/change-avatar/change-avatar.component';
import { NgStyle, DatePipe, DecimalPipe, DOCUMENT } from '@angular/common';
import { UserOnlineStatusComponent } from '../../addons/user-online-status/user-online-status.component';
import { ProfileActivityComponent } from '../../profile/profile-activity/profile-activity.component';
import { ProfileShoutsComponent } from '../../profile/profile-shouts/profile-shouts.component';
import { ProfilePostsComponent } from '../../profile/profile-posts/profile-posts.component';
import { ProfileCommentsComponent } from '../../profile/profile-comments/profile-comments.component';
import { ProfileFollowsComponent } from '../../profile/profile-follows/profile-follows.component';
import { ProfileInformationComponent } from '../../profile/profile-information/profile-information.component';
import { PerfilSocialMediaButtonsComponent } from './perfil-social-media-buttons/perfil-social-media-buttons.component';
import { PerfilUserFollowersComponent } from './perfil-user-followers/perfil-user-followers.component';
import { PerfilMedallasComponent } from './perfil-medallas/perfil-medallas.component';
import { ProfileMedallasComponent } from '../../profile/profile-medallas/profile-medallas.component';
import { AnuncioComponent } from '../../ads/anuncio/anuncio.component';
import { PORTADA_VALIDA, urlCss } from 'src/app/shared/helpers/url-css';

export type PestanaPerfil =
  | 'shouts'
  | 'activity'
  | 'posts'
  | 'comments'
  | 'followers'
  | 'following'
  | 'medals'
  | 'information';

/** Pestañas del perfil. La activa vive en ?tab= (salvo el muro, que es la de inicio) para poder enlazarla. */
export const PESTANAS_PERFIL: {
  id: PestanaPerfil;
  label: string;
  icono: string;
}[] = [
  { id: 'shouts', label: 'Muro', icono: 'ti-message-circle' },
  // { id: 'activity', label: 'Actividad', icono: 'ti-antenna' },
  { id: 'posts', label: 'Posts', icono: 'ti-file-text' },
  { id: 'comments', label: 'Comentarios', icono: 'ti-message-dots' },
  { id: 'followers', label: 'Seguidores', icono: 'ti-users' },
  { id: 'following', label: 'Siguiendo', icono: 'ti-user-check' },
  { id: 'medals', label: 'Medallas', icono: 'ti-award' },
  { id: 'information', label: 'Información', icono: 'ti-info-circle' },
];

const PESTANA_INICIAL: PestanaPerfil = 'shouts';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  imports: [
    RouterLink,
    UserAvatarComponent,
    GenreIconComponent,
    CountryFlagComponent,
    MatTooltip,
    FollowButtonComponent,
    SendMessageButtonComponent,
    BanearUsuarioComponent,
    ChangeRangoComponent,
    ChangeAvatarComponent,
    NgStyle,
    UserOnlineStatusComponent,
    ProfileActivityComponent,
    ProfileShoutsComponent,
    ProfilePostsComponent,
    ProfileCommentsComponent,
    ProfileFollowsComponent,
    ProfileInformationComponent,
    PerfilSocialMediaButtonsComponent,
    PerfilUserFollowersComponent,
    PerfilMedallasComponent,
    ProfileMedallasComponent,
    AnuncioComponent,
    DatePipe,
    DecimalPipe,
    FormsModule,
    ArrastrarFondoDirective,
  ],
  host: {
    // El fondo de página lo pinta app.component (desde la barra de noticias hasta el pie); aquí solo se marca
    // para darle contraste a los títulos de las pestañas.
    '[class.pf-con-fondo]': '!!fondoPaginaCss',
  },
})
export class PerfilComponent implements OnInit {
  private readonly documento = inject(DOCUMENT);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private securityService = inject(IHttpSecurityService);
  private bloqueosService = inject(IHttpBloqueosService);
  private notificationService = inject(NotificationService);
  private displayService = inject(DisplayComponentService);
  private seoService = inject(SEOService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private dialog = inject(MatDialog);

  private readonly destroyRef = inject(DestroyRef);

  /** Edición de la portada desde el propio perfil (lo mismo que "Fondo de perfil" en /cuenta). */
  readonly editandoBanner = signal(false);
  readonly guardandoBanner = signal(false);
  readonly bannerUrl = signal('');
  readonly posBanner = signal<PosicionFondo>({ x: 50, y: 50 });
  /** URL suelta para la directiva de arrastre: solo si es válida. */
  readonly bannerEdicionValida = computed(() => (PORTADA_VALIDA.test(this.bannerUrl().trim()) ? this.bannerUrl().trim() : ''));
  readonly bannerEdicionCss = computed(() => urlCss(this.bannerEdicionValida()));
  /** Vacía es válida: quita la portada. */
  readonly bannerInvalida = computed(() => !!this.bannerUrl().trim() && !this.bannerEdicionValida());

  public display: DisplayComponentModel = {
    mainMenu: true,
    footer: true,
    searchFooter: true,
    submenu: false,
    background: '',
  };
  /** Dueño del perfil: vacío hasta que llega del API (la plantilla lo lee desde el primer render). */
  public currentUser: PerfilUsuarioViewModel = PERFIL_VACIO;
  public loggedUser: JwtUserModel = this.securityService.getCurrentUser();
  public cargando = true;
  public noEncontrado = false;
  public currentSelection: PestanaPerfil = PESTANA_INICIAL;
  public bloqueoActivo: BloqueoViewModel | null = null;

  readonly pestanas = PESTANAS_PERFIL;

  constructor() {
    // El fondo de página es del perfil: al salir se quita (no todas las páginas llaman a setDisplay y quedaría puesto).
    this.destroyRef.onDestroy(() =>
      this.displayService.setDisplay({
        ...this.display,
        background: '',
        backgroundRepeat: undefined,
      }),
    );

    this.activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        this.getUserByUserName(values.get('userName') ?? '');
      });

    // La pestaña sale de la URL: así los contadores, el menú y el botón atrás siempre coinciden.
    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const tab = params.get('tab') as PestanaPerfil | null;
        this.currentSelection =
          tab && PESTANAS_PERFIL.some((p) => p.id === tab)
            ? tab
            : PESTANA_INICIAL;
      });

    this.loggedUser = this.securityService.getCurrentUser();
  }

  /** Quien mira es otro usuario con sesión (puede seguir, escribir o bloquear). */
  get esAjeno(): boolean {
    return (
      !!this.loggedUser.usuario &&
      this.loggedUser.usuario.userName !== this.currentUser.userName
    );
  }

  /** Ese usuario sigue a quien mira: insignia verde "Te sigue" junto al @usuario. */
  readonly teSigue = signal(false);
  private cargaTeSigue?: Subscription;

  private cargarTeSigue(userName: string): void {
    this.teSigue.set(false);
    this.cargaTeSigue?.unsubscribe();
    if (!this.esAjeno || !userName) return;
    this.cargaTeSigue = this.usuarioPerfilService
      .teSigue(userName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (s) => this.teSigue.set(!!s), error: () => undefined });
  }

  /** Quien mira es el dueño: puede cambiar el avatar y la portada desde acá. */
  get esMio(): boolean {
    return !!this.loggedUser.usuario && !!this.currentUser.userName && this.loggedUser.usuario.userName === this.currentUser.userName;
  }

  editarBanner(): void {
    this.bannerUrl.set(this.currentUser.profileBackground ?? '');
    this.posBanner.set({ x: this.currentUser.profileBackgroundPosX ?? 50, y: this.currentUser.profileBackgroundPosY ?? 50 });
    this.editandoBanner.set(true);
    // El campo aparece en el siguiente render.
    setTimeout(() => this.documento.getElementById('pf-banner-url')?.focus());
  }

  cancelarBanner(): void {
    this.editandoBanner.set(false);
  }

  /** Guarda solo la portada: el fondo de página se reenvía tal cual (el API guarda todo junto). */
  guardarBanner(): void {
    if (this.bannerInvalida() || this.guardandoBanner()) return;
    const url = this.bannerEdicionValida();
    const { x, y } = this.posBanner();
    this.guardandoBanner.set(true);
    this.usuarioPerfilService
      .changeBackgroundProfile({
        profileBackground: url,
        profileBackgroundPosX: x,
        profileBackgroundPosY: y,
        profilePageBackground: this.currentUser.profilePageBackground ?? '',
        profilePageBackgroundRepeat: this.currentUser.profilePageBackgroundRepeat ?? 'repeat',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ok) => {
          this.guardandoBanner.set(false);
          if (!ok) return;
          this.currentUser = { ...this.currentUser, profileBackground: url, profileBackgroundPosX: x, profileBackgroundPosY: y };
          this.editandoBanner.set(false);
          this.notificationService.success('Tu portada se actualizó', 'Perfil');
        },
        error: () => this.guardandoBanner.set(false),
      });
  }

  /** Mismo diálogo que en /cuenta (subir y recortar); el cropper se carga recién al abrirlo. */
  async cambiarAvatar(): Promise<void> {
    const { DialogChangeAvatarComponent } = await import('../../dialogs/dialog-change-avatar/dialog-change-avatar.component');
    this.dialog
      .open(DialogChangeAvatarComponent, { width: '350px', maxWidth: '95vw', disableClose: true })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((avatar?: string) => {
        if (!avatar) return;
        this.currentUser = { ...this.currentUser, avatar };
        const sesion = this.securityService.getCurrentUser();
        if (sesion.usuario) {
          sesion.usuario.avatar = avatar;
          this.securityService.setUserToLocalStorage(sesion);
        }
      });
  }

  /** Staff: farmeo de puntos, puntos concentrados en una cuenta y posibles multicuentas (el diálogo se carga al usarlo). */
  async analizarUsuario(): Promise<void> {
    const { DialogAnalisisUsuarioComponent } = await import('../../dialogs/dialog-analisis-usuario/dialog-analisis-usuario.component');
    this.dialog.open(DialogAnalisisUsuarioComponent, {
      width: '860px',
      maxWidth: '95vw',
      data: { usuarioId: this.currentUser.id, userName: this.currentUser.userName },
    });
  }

  /** Quien mira es staff: se muestran las herramientas de moderación (cada una valida su propio permiso). */
  get esStaff(): boolean {
    const rango = this.loggedUser.usuario?.rango;
    return rango === 'Administrador' || rango === 'Moderador';
  }

  get nombreVisible(): string {
    return this.currentUser.completeName?.trim() || this.currentUser.userName;
  }

  /** Imagen del banner: el "fondo de perfil" que el usuario eligió en /cuenta (allí se previsualiza como banner). */
  get bannerCss(): string | null {
    return urlCss(this.currentUser.profileBackground);
  }

  /** Fondo de la página del perfil (otro campo, distinto del banner), repetido según lo que eligió el usuario. */
  get fondoPaginaCss(): string | null {
    return urlCss(this.currentUser.profilePageBackground);
  }

  /** Cambia de pestaña dejando rastro en la URL; ?page= es de los posts y no se arrastra a otras pestañas. */
  seleccionar(tab: PestanaPerfil): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: tab === PESTANA_INICIAL ? null : tab, page: null },
      queryParamsHandling: 'merge',
    });
  }

  /** Flechas, Inicio y Fin mueven el foco entre pestañas (patrón de tabs de WAI-ARIA). */
  teclaPestana(evento: KeyboardEvent, actual: PestanaPerfil): void {
    const i = PESTANAS_PERFIL.findIndex((p) => p.id === actual);
    const destinos: Record<string, number> = {
      ArrowRight: (i + 1) % PESTANAS_PERFIL.length,
      ArrowLeft: (i - 1 + PESTANAS_PERFIL.length) % PESTANAS_PERFIL.length,
      Home: 0,
      End: PESTANAS_PERFIL.length - 1,
    };
    const destino = destinos[evento.key];
    if (destino === undefined) return;

    evento.preventDefault();
    const tab = PESTANAS_PERFIL[destino].id;
    this.seleccionar(tab);
    this.documento.getElementById(`perfil-tab-${tab}`)?.focus();
  }

  ngOnInit(): void {
    this.displayService.setDisplay(this.display);
  }

  getUserByUserName(userName: string): void {
    this.cargando = true;
    this.noEncontrado = false;
    this.bloqueoActivo = null;

    this.securityService
      .getUserByUserName(userName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // El API responde con error (400) cuando el usuario no existe.
        error: () => this.perfilNoEncontrado(),
        next: (value) => {
          if (!value) {
            this.perfilNoEncontrado();
            return;
          }

          this.currentUser = value;
          this.cargando = false;
          this.cargarTeSigue(value.userName);

          // Fondo de página del usuario (app.component lo limpia de caracteres peligrosos y lo pinta).
          this.display = {
            ...this.display,
            background: this.fondoPaginaCss
              ? (value.profilePageBackground ?? '')
              : '',
            backgroundRepeat: value.profilePageBackgroundRepeat ?? 'repeat',
          };
          this.displayService.setDisplay(this.display);

          const perfilVacio =
            !(this.currentUser.postsCount ?? 0) &&
            !(this.currentUser.comentariosCount ?? 0);
          this.seoService.setSEO({
            noIndex: perfilVacio,
            title: sumarContexto(
              this.nombreVisible !== this.currentUser.userName
                ? `${this.nombreVisible} (@${this.currentUser.userName})`
                : `@${this.currentUser.userName}`,
              'Perfil',
            ),
            description: `Perfil de ${this.currentUser.userName} en Taringa. Mira sus posts, shouts, seguidores y actividad en la comunidad.`,
            type: 'profile',
            imageURL: this.currentUser.avatar || '',
            tags: [this.currentUser.userName, 'perfil', 'usuario', 'taringas'],
            canonical: `${environment.publicUrl}${this.documento.location.pathname}`,
            jsonLd: {
              '@context': 'https://schema.org',
              '@type': 'ProfilePage',
              url: `${environment.publicUrl}${this.documento.location.pathname}`,
              dateCreated: this.currentUser.fechaRegistro,
              mainEntity: {
                '@type': 'Person',
                name: this.currentUser.userName,
                alternateName: this.currentUser.userName,
                image: this.currentUser.avatar || undefined,
                url: `${environment.publicUrl}/perfil/${this.currentUser.userName}`,
                interactionStatistic: [
                  {
                    '@type': 'InteractionCounter',
                    interactionType: 'https://schema.org/FollowAction',
                    userInteractionCount: this.currentUser.seguidoresCount ?? 0,
                  },
                  {
                    '@type': 'InteractionCounter',
                    interactionType: 'https://schema.org/WriteAction',
                    userInteractionCount: this.currentUser.postsCount ?? 0,
                  },
                ],
              },
            },
          });

          // Solo con sesión y en un perfil ajeno (antes comparaba loggedUser.userName, que no existe: pedía siempre).
          if (
            this.loggedUser.usuario &&
            this.loggedUser.usuario.userName !== userName
          ) {
            this.loadBloqueo(userName);
          }
        },
      });
  }

  /** Perfil inexistente: 404 real para que Google no lo tome como soft 404. */
  private perfilNoEncontrado(): void {
    this.cargando = false;
    this.noEncontrado = true;
    this.currentUser = PERFIL_VACIO;
    // Si se llega desde otro perfil con fondo, no debe quedar puesto.
    this.display = {
      ...this.display,
      background: '',
      backgroundRepeat: undefined,
    };
    this.displayService.setDisplay(this.display);
    this.seoService.setSEO({
      title: 'Perfil no encontrado',
      description: 'Este usuario no existe o fue dado de baja.',
      type: 'website',
      imageURL: '',
      tags: [],
      noIndex: true,
      statusCode: 404,
    });
  }

  loadBloqueo(userName: string): void {
    this.bloqueosService
      .getBloqueoContraPerfil(userName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (bloqueo) => (this.bloqueoActivo = bloqueo),
        error: () => {},
      });
  }

  bloquearUsuario(): void {
    this.bloqueosService
      .bloquearUsuario(this.currentUser.userName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (id) => {
          this.bloqueoActivo = {
            id,
            bloqueadoId: this.currentUser.id,
            userName: this.currentUser.userName,
            avatar: this.currentUser.avatar,
            fechaRegistro: new Date().toISOString(),
          };
          this.notificationService.success(
            `${this.currentUser.userName} ha sido bloqueado`,
            'Bloqueado',
          );
        },
        error: () => {},
      });
  }

  desbloquearUsuario(): void {
    if (!this.bloqueoActivo) return;
    this.bloqueosService
      .desbloquearUsuario(this.bloqueoActivo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success(
            `${this.currentUser.userName} ha sido desbloqueado`,
            'Desbloqueado',
          );
          this.bloqueoActivo = null;
        },
        error: () => {},
      });
  }
}

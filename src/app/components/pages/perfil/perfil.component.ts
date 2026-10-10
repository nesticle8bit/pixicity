import { PERFIL_VACIO, PerfilUsuarioViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { environment } from 'src/environments/environment';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpBloqueosService } from 'src/app/services/interfaces/httpBloqueos.interface';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { BloqueoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { MainProfileMenuComponent } from '../../main/main-profile-menu/main-profile-menu.component';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { GenreIconComponent } from '../../addons/genre-icon/genre-icon.component';
import { CountryFlagComponent } from '../../addons/country-flag/country-flag.component';
import { MatTooltip } from '@angular/material/tooltip';
import { FollowButtonComponent } from '../../addons/follow-button/follow-button.component';
import { SendMessageButtonComponent } from '../../addons/send-message-button/send-message-button.component';
import { BanearUsuarioComponent } from '../../admin/usuarios/usuarios/banear-usuario/banear-usuario.component';
import { ChangeRangoComponent } from '../../admin/usuarios/rangos/change-rango/change-rango.component';
import { ChangeAvatarComponent } from '../../admin/usuarios/usuarios/change-avatar/change-avatar.component';
import { NgStyle, DatePipe, DOCUMENT } from '@angular/common';
import { UserOnlineStatusComponent } from '../../addons/user-online-status/user-online-status.component';
import { ProfileActivityComponent } from '../../profile/profile-activity/profile-activity.component';
import { ProfileShoutsComponent } from '../../profile/profile-shouts/profile-shouts.component';
import { ProfilePostsComponent } from '../../profile/profile-posts/profile-posts.component';
import { ProfileCommentsComponent } from '../../profile/profile-comments/profile-comments.component';
import { ProfileFollowsComponent } from '../../profile/profile-follows/profile-follows.component';
import { ProfileInformationComponent } from '../../profile/profile-information/profile-information.component';
import { PerfilSocialMediaButtonsComponent } from './perfil-social-media-buttons/perfil-social-media-buttons.component';
import { PerfilUserMedalsComponent } from './perfil-user-medals/perfil-user-medals.component';
import { PerfilUserFollowersComponent } from './perfil-user-followers/perfil-user-followers.component';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';

@Component({
    selector: 'app-perfil',
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.scss'],
    imports: [
        MainProfileMenuComponent,
        RouterLink,
        UserAvatarComponent,
        UserPopoverDirective,
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
        PerfilUserMedalsComponent,
        PerfilUserFollowersComponent,
        AdsByTypeComponent,
        DatePipe,
    ],
})
export class PerfilComponent implements OnInit {
  private readonly documento = inject(DOCUMENT);
  private activatedRoute = inject(ActivatedRoute);
  private securityService = inject(IHttpSecurityService);
  private bloqueosService = inject(IHttpBloqueosService);
  private notificationService = inject(NotificationService);
  private displayService = inject(DisplayComponentService);
  private seoService = inject(SEOService);

  private readonly destroyRef = inject(DestroyRef);

  public display: DisplayComponentModel = { mainMenu: true, footer: true, searchFooter: true, submenu: false, background: ''};
  /** Dueño del perfil: vacío hasta que llega del API (la plantilla lo lee desde el primer render). */
  public currentUser: PerfilUsuarioViewModel = PERFIL_VACIO;
  public loggedUser: JwtUserModel = this.securityService.getCurrentUser();
  public currentSelection = 'shouts';
  public bloqueoActivo: BloqueoViewModel | null = null;

  constructor() {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.getUserByUserName(values.get('userName') ?? '');
    });

    this.loggedUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {
    this.displayService.setDisplay(this.display);
  }

  getUserByUserName(userName: string): void {
    this.securityService.getUserByUserName(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      // El API responde con error (400) cuando el usuario no existe.
      error: () => this.perfilNoEncontrado(),
      next: (value) => {
        if (!value) {
          this.perfilNoEncontrado();
          return;
        }

        this.currentUser = value;
        this.display.background = this.currentUser.profileBackground;
        this.displayService.setDisplay(this.display);

        this.seoService.setSEO({
          title: `${this.currentUser.userName} - Perfil`,
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
        if (this.loggedUser.usuario && this.loggedUser.usuario.userName !== userName) {
          this.loadBloqueo(userName);
        }
      },
    });
  }

  /** Perfil inexistente: 404 real para que Google no lo tome como soft 404. */
  private perfilNoEncontrado(): void {
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
    this.bloqueosService.getBloqueoContraPerfil(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (bloqueo) => this.bloqueoActivo = bloqueo,
      error: () => {}
    });
  }

  bloquearUsuario(): void {
    this.bloqueosService.bloquearUsuario(this.currentUser.userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (id) => {
        this.bloqueoActivo = { id, bloqueadoId: this.currentUser.id, userName: this.currentUser.userName, avatar: this.currentUser.avatar, fechaRegistro: new Date().toISOString() };
        this.notificationService.success(`${this.currentUser.userName} ha sido bloqueado`, 'Bloqueado');
      },
      error: () => {}
    });
  }

  desbloquearUsuario(): void {
    if (!this.bloqueoActivo) return;
    this.bloqueosService.desbloquearUsuario(this.bloqueoActivo.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success(`${this.currentUser.userName} ha sido desbloqueado`, 'Desbloqueado');
        this.bloqueoActivo = null;
      },
      error: () => {}
    });
  }

  selectedChanged(value: string): void {
    this.currentSelection = value;
  }
}

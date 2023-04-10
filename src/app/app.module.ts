import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { MainHeaderComponent } from './components/main/main-header/main-header.component';
import { MainMenuComponent } from './components/main/main-menu/main-menu.component';
import { MainSubmenuComponent } from './components/main/main-submenu/main-submenu.component';
import { SectionHomeComponent } from './components/sections/section-home/section-home.component';
import { HomeLastPostsComponent } from './components/home/home-last-posts/home-last-posts.component';
import { HomeStatsComponent } from './components/home/home-stats/home-stats.component';
import { HomeLastCommentsComponent } from './components/home/home-last-comments/home-last-comments.component';
import { HomeLastPhotosComponent } from './components/home/home-last-photos/home-last-photos.component';
import { HomeAfiliadosComponent } from './components/home/home-afiliados/home-afiliados.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { HomeTopPostsComponent } from './components/home/home-top-posts/home-top-posts.component';
import { HomeTopUsersComponent } from './components/home/home-top-users/home-top-users.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { DisplayComponentService } from './services/shared/displayComponents.service';
import { MainFooterComponent } from './components/main/main-footer/main-footer.component';
import { SearchComponent } from './components/pages/search/search.component';
import { PostsViewComponent } from './components/posts/posts-view/posts-view.component';
import { LoginComponent } from './components/pages/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { IHttpSecurityService } from './services/interfaces/httpSecurity.interface';
import { HttpSecurityService } from './services/implementations/httpSecurity.service';
import { IHttpParametrosService } from './services/interfaces/httpParametros.interface';
import { HttpParametrosService } from './services/implementations/httpParametros.service';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { SectionUserInfoLoginComponent } from './components/sections/section-user-info-login/section-user-info-login.component';
import { PostsCreateComponent } from './components/posts/posts-create/posts-create.component';
import { ModHistoryComponent } from './components/pages/mod-history/mod-history.component';
import { UsuariosComponent } from './components/pages/usuarios/usuarios.component';
import { MonitorComponent } from './components/pages/monitor/monitor.component';
import { MensajesComponent } from './components/pages/mensajes/mensajes.component';
import { FavoritosComponent } from './components/pages/favoritos/favoritos.component';
import { TopsComponent } from './components/pages/tops/tops.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogAfiliarseComponent } from './components/dialogs/dialog-afiliarse/dialog-afiliarse.component';
import { IHttpGeneralService } from './services/interfaces/httpGeneral.interface';
import { HttpGeneralService } from './services/implementations/httpGeneral.service';
import { TopTimesSelectorComponent } from './components/sections/top-times-selector/top-times-selector.component';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { CategoriesSelectorComponent } from './components/sections/categories-selector/categories-selector.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogPrevisualizarPostComponent } from './components/dialogs/dialog-previsualizar-post/dialog-previsualizar-post.component';
import { IHttpPostsService } from './services/interfaces/httpPosts.interface';
import { HttpPostsService } from './services/implementations/httpPosts.service';
import { getSpanishPaginatorIntl } from './shared/helpers/getSpanishPaginatorIntl';
import { TruncatePipe } from './shared/pipes/truncate.pipe';
import { NgxEditorModule } from 'ngx-editor';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from 'ngx-ui-loader';
import { TimeAgoPipe } from './shared/pipes/timeAgo.pipe';
import { PostNotFoundComponent } from './components/posts/post-not-found/post-not-found.component';
import { PostCommentsComponent } from './components/posts/post-comments/post-comments.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { BorradoresComponent } from './components/pages/borradores/borradores.component';
import { PostsBreadcrumbComponent } from './components/posts/posts-breadcrumb/posts-breadcrumb.component';
import { PostsNavComponent } from './components/posts/posts-nav/posts-nav.component';
import { PostsTagsComponent } from './components/posts/posts-tags/posts-tags.component';
import { PostsMetaComponent } from './components/posts/posts-meta/posts-meta.component';
import { DialogDenunciarPostComponent } from './components/dialogs/dialog-denunciar-post/dialog-denunciar-post.component';
import { DashboardAdminComponent } from './components/admin/dashboard-admin/dashboard-admin.component';
import { IHttpFavoritosService } from './services/interfaces/httpFavoritos.interface';
import { HttpFavoritosService } from './services/implementations/httpFavoritos.service';
import { environment } from 'src/environments/environment';
import { MatTableModule } from '@angular/material/table';
import { AccountComponent } from './components/pages/account/account.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PerfilComponent } from './components/pages/perfil/perfil.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { DashboardSidebarComponent } from './components/admin/dashboard-sidebar/dashboard-sidebar.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { DashboardPostsComponent } from './components/admin/control-de-contenido/posts/dashboard-posts/dashboard-posts.component';
import { TablePostsComponent } from './components/admin/control-de-contenido/posts/table-posts/table-posts.component';
import { MatMenuModule } from '@angular/material/menu';
import { DashboardAfiliadosComponent } from './components/admin/control-de-comunidad/afiliados/dashboard-afiliados/dashboard-afiliados.component';
import { TableAfiliadosComponent } from './components/admin/control-de-comunidad/afiliados/table-afiliados/table-afiliados.component';
import { DashboardAdsComponent } from './components/admin/general/publicidad/dashboard-ads/dashboard-ads.component';
import { DashboardConfigurationComponent } from './components/admin/general/configuration/dashboard-configuration/dashboard-configuration.component';
import { DashboardCommentsComponent } from './components/admin/control-de-contenido/comentarios/dashboard-comments/dashboard-comments.component';
import { TableCommentsComponent } from './components/admin/control-de-contenido/comentarios/table-comments/table-comments.component';
import { DashboardPaisesComponent } from './components/admin/control-de-contenido/paises/dashboard-paises/dashboard-paises.component';
import { TablePaisesComponent } from './components/admin/control-de-contenido/paises/table-paises/table-paises.component';
import { EnVivoComponent } from './components/pages/en-vivo/en-vivo.component';
import { DashboardSesionesComponent } from './components/admin/usuarios/sesiones/dashboard-sesiones/dashboard-sesiones.component';
import { TableSesionesComponent } from './components/admin/usuarios/sesiones/table-sesiones/table-sesiones.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { IHttpLogsService } from './services/interfaces/httpLogs.interface';
import { HttpLogsService } from './services/implementations/httpLogs.service';
import { TipoIconMonitorComponent } from './components/addons/tipo-icon-monitor/tipo-icon-monitor.component';
import { DialogUpdatePaisesComponent } from './components/admin/control-de-contenido/paises/dialog-update-paises/dialog-update-paises.component';
import { UppercaseDirective } from './shared/directives/uppercase.directive';
import { DashboardReportesComponent } from './components/admin/control-de-comunidad/reportes/dashboard-reportes/dashboard-reportes.component';
import { TableReportesComponent } from './components/admin/control-de-comunidad/reportes/table-reportes/table-reportes.component';
import { IHttpDenunciasService } from './services/interfaces/httpDenuncias.interface';
import { HttpDenunciasService } from './services/implementations/httpDenuncias.service';
import { ProfileCommentsComponent } from './components/profile/profile-comments/profile-comments.component';
import { ProfilePostsComponent } from './components/profile/profile-posts/profile-posts.component';
import { PostOriginalPosterInfoComponent } from './components/posts/post-original-poster-info/post-original-poster-info.component';
import { FollowButtonComponent } from './components/addons/follow-button/follow-button.component';
import { IHttpWebService } from './services/interfaces/httpWeb.interface';
import { HttpWebService } from './services/implementations/httpWeb.service';
import { PostRelatedPostsComponent } from './components/posts/post-related-posts/post-related-posts.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileShoutsComponent } from './components/profile/profile-shouts/profile-shouts.component';
import { ProfileFollowingComponent } from './components/profile/profile-following/profile-following.component';
import { ProfileFollowersComponent } from './components/profile/profile-followers/profile-followers.component';
import { MainProfileMenuComponent } from './components/main/main-profile-menu/main-profile-menu.component';
import { ProfileInformationComponent } from './components/profile/profile-information/profile-information.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdsByTypeComponent } from './components/ads/ads-by-type/ads-by-type.component';
import { PerfilSocialMediaButtonsComponent } from './components/pages/perfil/perfil-social-media-buttons/perfil-social-media-buttons.component';
import { PerfilUserMedalsComponent } from './components/pages/perfil/perfil-user-medals/perfil-user-medals.component';
import { PerfilUserFollowersComponent } from './components/pages/perfil/perfil-user-followers/perfil-user-followers.component';
import { TagsCloudComponent } from './components/addons/tags-cloud/tags-cloud.component';
import { DashboardUsuariosComponent } from './components/admin/usuarios/usuarios/dashboard-usuarios/dashboard-usuarios.component';
import { TableUsuariosComponent } from './components/admin/usuarios/usuarios/table-usuarios/table-usuarios.component';
import { CountryFlagComponent } from './components/addons/country-flag/country-flag.component';
import { MiHomeComponent } from './components/mi/mi-home/mi-home.component';
import { PostPrivadoComponent } from './components/posts/post-privado/post-privado.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BottomSheetsEmojisComponent } from './components/bottom-sheets/bottom-sheets-emojis/bottom-sheets-emojis.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DialogChangeAvatarComponent } from './components/dialogs/dialog-change-avatar/dialog-change-avatar.component';
import { UserAvatarComponent } from './components/addons/user-avatar/user-avatar.component';
import { HomeLastRegisteredUsersComponent } from './components/home/home-last-registered-users/home-last-registered-users.component';
import { GenreIconComponent } from './components/addons/genre-icon/genre-icon.component';
import { DashboardRangosComponent } from './components/admin/usuarios/rangos/dashboard-rangos/dashboard-rangos.component';
import { TableRangosComponent } from './components/admin/usuarios/rangos/table-rangos/table-rangos.component';
import { ProfileActivityComponent } from './components/profile/profile-activity/profile-activity.component';
import { TipoActividadIconComponent } from './components/addons/tipo-actividad-icon/tipo-actividad-icon.component';
import { DialogAddUpdateRangoComponent } from './components/dialogs/dialog-add-update-rango/dialog-add-update-rango.component';
import { ChangeRangoComponent } from './components/admin/usuarios/rangos/change-rango/change-rango.component';
import { DialogChangeRangosComponent } from './components/dialogs/dialog-change-rangos/dialog-change-rangos.component';
import { BanearUsuarioComponent } from './components/admin/usuarios/usuarios/banear-usuario/banear-usuario.component';
import { DialogBanUserComponent } from './components/dialogs/dialog-ban-user/dialog-ban-user.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { DialogUpdateAfiliadosComponent } from './components/admin/control-de-comunidad/afiliados/dialog-update-afiliados/dialog-update-afiliados.component';
import { PageContactoComponent } from './components/pages/page-contacto/page-contacto.component';
import { SEOService } from './services/shared/seo.service';
import {
  RecaptchaFormsModule,
  RecaptchaModule,
  RECAPTCHA_LANGUAGE,
} from 'ng-recaptcha';
import { ReCaptchaComponent } from './components/addons/re-captcha/re-captcha.component';
import { DialogRecomendarPostComponent } from './components/dialogs/dialog-recomendar-post/dialog-recomendar-post.component';
import { DialogVerReporteComponent } from './components/admin/control-de-comunidad/reportes/dialog-ver-reporte/dialog-ver-reporte.component';
import { PostUrlLinkComponent } from './components/addons/post-url-link/post-url-link.component';
import { DialogDisplayHistoryCommentsComponent } from './components/dialogs/dialog-display-history-comments/dialog-display-history-comments.component';
import { ApiDocumentationComponent } from './components/pages/api-documentation/api-documentation.component';
import { ProfileShoutsWallComponent } from './components/profile/profile-shouts-wall/profile-shouts-wall.component';
import { WhoIsIpComponent } from './components/addons/who-is-ip/who-is-ip.component';
import { IHttpPerfilService } from './services/interfaces/httpPerfil.interface';
import { HttpPerfilService } from './services/implementations/httpPerfil.service';
import { ShoutsViewComponent } from './components/pages/shouts/shouts-view/shouts-view.component';
import { DashboardShoutsComponent } from './components/admin/control-de-contenido/shouts/dashboard-shouts/dashboard-shouts.component';
import { TableShoutsComponent } from './components/admin/control-de-contenido/shouts/table-shouts/table-shouts.component';
import { ChangeAvatarComponent } from './components/admin/usuarios/usuarios/change-avatar/change-avatar.component';
import { DashboardCategoriasComponent } from './components/admin/control-de-comunidad/categorias/dashboard-categorias/dashboard-categorias.component';
import { TableCategoriasComponent } from './components/admin/control-de-comunidad/categorias/table-categorias/table-categorias.component';
import { DialogCreateUpdateCategoriasComponent } from './components/admin/control-de-comunidad/categorias/dialog-create-update-categorias/dialog-create-update-categorias.component';
import { PostMoreFromOPComponent } from './components/posts/post-more-from-op/post-more-from-op.component';
import { DashboardEstadisticasComponent } from './components/admin/control-de-comunidad/estadisticas/dashboard-estadisticas/dashboard-estadisticas.component';
import { DashboardNoticiasComponent } from './components/admin/control-de-contenido/noticias/dashboard-noticias/dashboard-noticias.component';
import { DashboardMonitorComponent } from './components/admin/control-de-contenido/monitor/dashboard-monitor/dashboard-monitor.component';
import { TableMonitorComponent } from './components/admin/control-de-contenido/monitor/table-monitor/table-monitor.component';
import { DialogRangosChangesReportComponent } from './components/admin/usuarios/rangos/dialog-rangos-changes-report/dialog-rangos-changes-report.component';
import { DashboardContactosComponent } from './components/admin/control-de-contenido/contactos/dashboard-contactos/dashboard-contactos.component';
import { TableContactosComponent } from './components/admin/control-de-contenido/contactos/table-contactos/table-contactos.component';
import { DashboardVotosComponent } from './components/admin/control-de-comunidad/votos/dashboard-votos/dashboard-votos.component';
import { TableVotosComponent } from './components/admin/control-de-comunidad/votos/table-votos/table-votos.component';
import { SectionHomeForumComponent } from './components/sections/section-home-forum/section-home-forum.component';
import { UserOnlineStatusComponent } from './components/addons/user-online-status/user-online-status.component';
import { PostsGeneratorComponent } from './components/posts/posts-generator/posts-generator.component';
import { TableNoticiasComponent } from './components/admin/control-de-contenido/noticias/table-noticias/table-noticias.component';
import { IHttpNoticiasService } from './services/interfaces/httpNoticias.interface';
import { HttpNoticiasService } from './services/implementations/httpNoticias.service';
import { DialogCreateUpdateNoticiasComponent } from './components/admin/control-de-contenido/noticias/dialog-create-update-noticias/dialog-create-update-noticias.component';
import { MainUltimasNoticiasComponent } from './components/main/main-ultimas-noticias/main-ultimas-noticias.component';
import { ClickOutsideDirective } from './shared/directives/clickOutside.directive';
import { DashboardPaginasComponent } from './components/admin/control-de-contenido/paginas/dashboard-paginas/dashboard-paginas.component';
import { TablePaginasComponent } from './components/admin/control-de-contenido/paginas/table-paginas/table-paginas.component';
import { DialogCreateUpdatePaginasComponent } from './components/admin/control-de-contenido/paginas/dialog-create-update-paginas/dialog-create-update-paginas.component';
import { PaginasComponent } from './components/pages/paginas/paginas.component';
import { IHttpMensajesService } from './services/interfaces/httpMensajes.interface';
import { HttpMensajesService } from './services/implementations/httpMensajes.service';
import { DialogEnviarMPComponent } from './components/dialogs/dialog-enviar-mp/dialog-enviar-mp.component';
import { MensajesConversacionComponent } from './components/pages/mensajes/mensajes-conversacion/mensajes-conversacion.component';
import { MensajesSidebarComponent } from './components/pages/mensajes/mensajes-sidebar/mensajes-sidebar.component';
import { MensajesEnviadosComponent } from './components/pages/mensajes/mensajes-enviados/mensajes-enviados.component';
import { SendMessageButtonComponent } from './components/addons/send-message-button/send-message-button.component';
import { TableMensajesComponent } from './components/admin/control-de-contenido/mensajes/table-mensajes/table-mensajes.component';
import { DashboardMensajesComponent } from './components/admin/control-de-contenido/mensajes/dashboard-mensajes/dashboard-mensajes.component';

@NgModule({
  declarations: [
    AppComponent,
    MainHeaderComponent,
    MainMenuComponent,
    MainSubmenuComponent,
    SectionHomeComponent,
    HomeLastPostsComponent,
    HomeStatsComponent,
    HomeLastCommentsComponent,
    HomeLastPhotosComponent,
    HomeAfiliadosComponent,
    HomeTopPostsComponent,
    HomeTopUsersComponent,
    RegisterComponent,
    MainFooterComponent,
    SearchComponent,
    PostsViewComponent,
    LoginComponent,
    SectionUserInfoLoginComponent,
    PostsCreateComponent,
    ModHistoryComponent,
    UsuariosComponent,
    MonitorComponent,
    MensajesComponent,
    FavoritosComponent,
    TopsComponent,
    DialogAfiliarseComponent,
    TopTimesSelectorComponent,
    CategoriesSelectorComponent,
    DialogPrevisualizarPostComponent,
    TruncatePipe,
    TimeAgoPipe,
    PostNotFoundComponent,
    PostCommentsComponent,
    BorradoresComponent,
    PostsBreadcrumbComponent,
    PostsNavComponent,
    PostsTagsComponent,
    PostsMetaComponent,
    DialogDenunciarPostComponent,
    DashboardAdminComponent,
    AccountComponent,
    PerfilComponent,
    DashboardSidebarComponent,
    DashboardComponent,
    DashboardPostsComponent,
    TablePostsComponent,
    DashboardAfiliadosComponent,
    TableAfiliadosComponent,
    DashboardAdsComponent,
    DashboardConfigurationComponent,
    DashboardCommentsComponent,
    TableCommentsComponent,
    DashboardPaisesComponent,
    TablePaisesComponent,
    EnVivoComponent,
    DashboardSesionesComponent,
    TableSesionesComponent,
    TipoIconMonitorComponent,
    DialogUpdatePaisesComponent,
    UppercaseDirective,
    DashboardReportesComponent,
    TableReportesComponent,
    ProfileCommentsComponent,
    ProfilePostsComponent,
    PostOriginalPosterInfoComponent,
    FollowButtonComponent,
    PostRelatedPostsComponent,
    ProfileShoutsComponent,
    ProfileFollowingComponent,
    ProfileFollowersComponent,
    MainProfileMenuComponent,
    ProfileInformationComponent,
    AdsByTypeComponent,
    PerfilSocialMediaButtonsComponent,
    PerfilUserMedalsComponent,
    PerfilUserFollowersComponent,
    TagsCloudComponent,
    DashboardUsuariosComponent,
    TableUsuariosComponent,
    CountryFlagComponent,
    MiHomeComponent,
    PostPrivadoComponent,
    BottomSheetsEmojisComponent,
    DialogChangeAvatarComponent,
    UserAvatarComponent,
    HomeLastRegisteredUsersComponent,
    GenreIconComponent,
    DashboardRangosComponent,
    TableRangosComponent,
    ProfileActivityComponent,
    TipoActividadIconComponent,
    DialogAddUpdateRangoComponent,
    ChangeRangoComponent,
    DialogChangeRangosComponent,
    BanearUsuarioComponent,
    DialogBanUserComponent,
    DialogUpdateAfiliadosComponent,
    PageContactoComponent,
    ReCaptchaComponent,
    DialogRecomendarPostComponent,
    DialogVerReporteComponent,
    PostUrlLinkComponent,
    DialogDisplayHistoryCommentsComponent,
    ApiDocumentationComponent,
    ProfileShoutsWallComponent,
    WhoIsIpComponent,
    ShoutsViewComponent,
    DashboardShoutsComponent,
    TableShoutsComponent,
    ChangeAvatarComponent,
    DashboardCategoriasComponent,
    TableCategoriasComponent,
    DialogCreateUpdateCategoriasComponent,
    PostMoreFromOPComponent,
    DashboardEstadisticasComponent,
    DashboardNoticiasComponent,
    DashboardMonitorComponent,
    TableMonitorComponent,
    DialogRangosChangesReportComponent,
    DashboardContactosComponent,
    TableContactosComponent,
    DashboardVotosComponent,
    TableVotosComponent,
    SectionHomeForumComponent,
    UserOnlineStatusComponent,
    PostsGeneratorComponent,
    TableNoticiasComponent,
    DialogCreateUpdateNoticiasComponent,
    MainUltimasNoticiasComponent,
    ClickOutsideDirective,
    DashboardPaginasComponent,
    TablePaginasComponent,
    DialogCreateUpdatePaginasComponent,
    PaginasComponent,
    DialogEnviarMPComponent,
    MensajesConversacionComponent,
    MensajesSidebarComponent,
    MensajesEnviadosComponent,
    SendMessageButtonComponent,
    TableMensajesComponent,
    DashboardMensajesComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    NgSelectModule,
    MatCheckboxModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 6000,
      positionClass: 'toast-top-right',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    }),
    MatDialogModule,
    MatPaginatorModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    NgxEditorModule.forRoot({
      locals: {
        bold: 'Negrita [Ctrl+B]',
        italic: 'Cursiva [Ctrl+I]',
        code: 'Code',
        underline: 'Subrayado [Ctrl+U]',
        strike: 'Tachado',
        blockquote: 'Cita',
        bullet_list: 'Lista de viñetas',
        ordered_list: 'Lista ordenada',
        heading: 'Encabezado',
        h1: 'Encabezado 1',
        h2: 'Encabezado 2',
        h3: 'Encabezado 3',
        h4: 'Encabezado 4',
        h5: 'Encabezado 5',
        h6: 'Encabezado 6',
        align_left: 'Alinear a la izquierda',
        align_center: 'Centrar',
        align_right: 'Alinear a la derecha',
        align_justify: 'Justificar',
        text_color: 'Color',
        background_color: 'Color de fondo',
        url: 'URL',
        text: 'Texto',
        openInNewTab: 'Abrir en una nueva pestaña',
        insert: 'Insertar',
        altText: 'Texto alternativo',
        title: 'Título',
        remove: 'Eliminar',
        insertImage: 'Insertar imagen',
      },
    }),
    NgxUiLoaderModule,
    NgxUiLoaderHttpModule.forRoot({
      showForeground: true,
      exclude: [
        `${environment.api}/api/favoritos/getFavoritos`,
        `${environment.api}/api/favoritos/getLastFavoritos`,
        `${environment.api}/api/monitors/getLastNotificaciones`,
        `${environment.api}/api/mensajes/getLastMensajes`,
        `${environment.api}/api/comentarios/getComentariosRecientes`,
        `${environment.api}/api/tops/getTopPosts`,
        `${environment.api}/api/posts/getBorradores`,
        `${environment.api}/api/monitors/setNotificacionesAsReaded`,
        `${environment.api}/api/posts/getPostsRelatedByTitle`,
        `${environment.api}/api/mensajes/setMensajesAsReaded`,
        `${environment.api}/api/noticias/getAllNoticias`,
        `${environment.api}/api/paginas/getAllPaginas`,
        `${environment.api}/api/configuracion/getFooter`,
        `${environment.api}/api/monitors/getStats`,
        `${environment.api}/api/usuarios/sessionOnlineUser`,
        `${environment.api}/api/posts/getStickyPosts`,
        `${environment.api}/api/tops/getTopUsers`,
        `${environment.api}/api/web/getAdsByType`,
        `${environment.api}/api/categorias/getCategoriasDropdown`,
        `${environment.api}/api/usuarios/isFollowingTheUser`,
        `${environment.api}/api/posts/getCloudTags`,
        `${environment.api}/api/web/getAfiliados`,
        `${environment.api}/api/general/getEstadisticas`,
      ],
    }),
    MatRadioModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    PickerModule,
    MatBottomSheetModule,
    ImageCropperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
  providers: [
    DisplayComponentService,
    SEOService,
    Title,
    { provide: IHttpSecurityService, useClass: HttpSecurityService },
    { provide: IHttpParametrosService, useClass: HttpParametrosService },
    { provide: IHttpGeneralService, useClass: HttpGeneralService },
    { provide: IHttpPostsService, useClass: HttpPostsService },
    { provide: IHttpFavoritosService, useClass: HttpFavoritosService },
    { provide: IHttpLogsService, useClass: HttpLogsService },
    { provide: IHttpDenunciasService, useClass: HttpDenunciasService },
    { provide: IHttpWebService, useClass: HttpWebService },
    { provide: IHttpPerfilService, useClass: HttpPerfilService },
    { provide: IHttpNoticiasService, useClass: HttpNoticiasService },
    { provide: IHttpMensajesService, useClass: HttpMensajesService },

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },
    { provide: LOCALE_ID, useValue: 'es' },

    { provide: RECAPTCHA_LANGUAGE, useValue: 'es' },
  ],
  entryComponents: [DialogAfiliarseComponent, DialogPrevisualizarPostComponent],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(library: FaIconLibrary, private ngSelectConfig: NgSelectConfig) {
    library.addIconPacks(fas, far, fab);

    ngSelectConfig.notFoundText = 'No hay elementos';
    ngSelectConfig.appendTo = 'body';

    registerLocaleData(localeEs, 'es');
  }
}

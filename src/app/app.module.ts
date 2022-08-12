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
import { MainHeaderComponent } from './main/main-header/main-header.component';
import { MainMenuComponent } from './main/main-menu/main-menu.component';
import { MainSubmenuComponent } from './main/main-submenu/main-submenu.component';
import { SectionHomeComponent } from './sections/section-home/section-home.component';
import { HomeLastPostsComponent } from './home/home-last-posts/home-last-posts.component';
import { HomeStatsComponent } from './home/home-stats/home-stats.component';
import { HomeLastCommentsComponent } from './home/home-last-comments/home-last-comments.component';
import { HomeLastPhotosComponent } from './home/home-last-photos/home-last-photos.component';
import { HomeAfiliadosComponent } from './home/home-afiliados/home-afiliados.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { HomeTopPostsComponent } from './home/home-top-posts/home-top-posts.component';
import { HomeTopUsersComponent } from './home/home-top-users/home-top-users.component';
import { RegisterComponent } from './pages/register/register.component';
import { DisplayComponentService } from './services/shared/displayComponents.service';
import { MainFooterComponent } from './main/main-footer/main-footer.component';
import { SearchComponent } from './pages/search/search.component';
import { PostsViewComponent } from './posts/posts-view/posts-view.component';
import { LoginComponent } from './pages/login/login.component';
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
import { PostsCreateComponent } from './posts/posts-create/posts-create.component';
import { ModHistoryComponent } from './pages/mod-history/mod-history.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { MonitorComponent } from './pages/monitor/monitor.component';
import { MensajesComponent } from './pages/mensajes/mensajes.component';
import { FavoritosComponent } from './pages/favoritos/favoritos.component';
import { TopsComponent } from './pages/tops/tops.component';
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
import { PostNotFoundComponent } from './posts/post-not-found/post-not-found.component';
import { PostCommentsComponent } from './posts/post-comments/post-comments.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { BorradoresComponent } from './pages/borradores/borradores.component';
import { PostsBreadcrumbComponent } from './posts/posts-breadcrumb/posts-breadcrumb.component';
import { PostsNavComponent } from './posts/posts-nav/posts-nav.component';
import { PostsTagsComponent } from './posts/posts-tags/posts-tags.component';
import { PostsMetaComponent } from './posts/posts-meta/posts-meta.component';
import { DialogDenunciarPostComponent } from './components/dialogs/dialog-denunciar-post/dialog-denunciar-post.component';
import { DashboardAdminComponent } from './components/admin/dashboard-admin/dashboard-admin.component';
import { IHttpFavoritosService } from './services/interfaces/httpFavoritos.interface';
import { HttpFavoritosService } from './services/implementations/httpFavoritos.service';
import { environment } from 'src/environments/environment';
import { MatTableModule } from '@angular/material/table';
import { AccountComponent } from './pages/account/account.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PerfilComponent } from './pages/perfil/perfil.component';
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
import { EnVivoComponent } from './pages/en-vivo/en-vivo.component';
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
import { PostOriginalPosterInfoComponent } from './posts/post-original-poster-info/post-original-poster-info.component';
import { FollowButtonComponent } from './components/addons/follow-button/follow-button.component';
import { IHttpWebService } from './services/interfaces/httpWeb.interface';
import { HttpWebService } from './services/implementations/httpWeb.service';
import { PostRelatedPostsComponent } from './posts/post-related-posts/post-related-posts.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileShoutsComponent } from './components/profile/profile-shouts/profile-shouts.component';
import { ProfileFollowingComponent } from './components/profile/profile-following/profile-following.component';
import { ProfileFollowersComponent } from './components/profile/profile-followers/profile-followers.component';
import { PageProtocoloComponent } from './pages/page-protocolo/page-protocolo.component';
import { MainProfileMenuComponent } from './main/main-profile-menu/main-profile-menu.component';
import { ProfileInformationComponent } from './components/profile/profile-information/profile-information.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdsByTypeComponent } from './components/ads/ads-by-type/ads-by-type.component';
import { PerfilSocialMediaButtonsComponent } from './pages/perfil/perfil-social-media-buttons/perfil-social-media-buttons.component';
import { PerfilUserMedalsComponent } from './pages/perfil/perfil-user-medals/perfil-user-medals.component';
import { PerfilUserFollowersComponent } from './pages/perfil/perfil-user-followers/perfil-user-followers.component';
import { TagsCloudComponent } from './components/addons/tags-cloud/tags-cloud.component';
import { DashboardUsuariosComponent } from './components/admin/usuarios/usuarios/dashboard-usuarios/dashboard-usuarios.component';
import { TableUsuariosComponent } from './components/admin/usuarios/usuarios/table-usuarios/table-usuarios.component';
import { CountryFlagComponent } from './components/addons/country-flag/country-flag.component';
import { MiHomeComponent } from './components/mi/mi-home/mi-home.component';
import { PostPrivadoComponent } from './posts/post-privado/post-privado.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BottomSheetsEmojisComponent } from './components/bottom-sheets/bottom-sheets-emojis/bottom-sheets-emojis.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DialogChangeAvatarComponent } from './components/dialogs/dialog-change-avatar/dialog-change-avatar.component';
import { UserAvatarComponent } from './components/addons/user-avatar/user-avatar.component';
import { HomeLastRegisteredUsersComponent } from './home/home-last-registered-users/home-last-registered-users.component';
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
import { PageTermsConditionsComponent } from './pages/page-terms-conditions/page-terms-conditions.component';
import { PageContactoComponent } from './pages/page-contacto/page-contacto.component';
import { DMCAComponent } from './pages/dmca/dmca.component';
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
    PageProtocoloComponent,
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
    PageTermsConditionsComponent,
    PageContactoComponent,
    DMCAComponent,
    ReCaptchaComponent,
    DialogRecomendarPostComponent,
    DialogVerReporteComponent,
    PostUrlLinkComponent,
    DialogDisplayHistoryCommentsComponent,
  ],
  imports: [
    BrowserModule,
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
        `${environment.api}/api/comentarios/getComentariosRecientes`,
        `${environment.api}/api/tops/getTopPosts`,
        `${environment.api}/api/posts/getBorradores`,
        `${environment.api}/api/monitors/setNotificacionesAsReaded`,
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

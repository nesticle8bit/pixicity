import { IHttpSilenciosService } from './services/interfaces/httpSilencios.interface';
import { HttpSilenciosService } from './services/implementations/httpSilencios.service';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from 'ngx-ui-loader';
import { environment } from 'src/environments/environment';

import { routes } from './app.routes';
import { HttpAppLogsService } from './services/implementations/httpAppLogs.service';
import { HttpBloqueosService } from './services/implementations/httpBloqueos.service';
import { HttpComunidadesService } from './services/implementations/httpComunidades.service';
import { HttpFavoritosService } from './services/implementations/httpFavoritos.service';
import { HttpFotosService } from './services/implementations/httpFotos.service';
import { HttpGeneralService } from './services/implementations/httpGeneral.service';
import { HttpLogsService } from './services/implementations/httpLogs.service';
import { HttpMensajesService } from './services/implementations/httpMensajes.service';
import { HttpModeracionService } from './services/implementations/httpModeracion.service';
import { HttpNoticiasService } from './services/implementations/httpNoticias.service';
import { HttpParametrosService } from './services/implementations/httpParametros.service';
import { HttpPerfilService } from './services/implementations/httpPerfil.service';
import { HttpPostsService } from './services/implementations/httpPosts.service';
import { HttpSecurityService } from './services/implementations/httpSecurity.service';
import { HttpWebService } from './services/implementations/httpWeb.service';
import { HttpUsuarioPerfilService } from './services/implementations/httpUsuarioPerfil.service';
import { HttpRangosService } from './services/implementations/httpRangos.service';
import { HttpComentariosPostService } from './services/implementations/httpComentariosPost.service';
import { IHttpAppLogsService } from './services/interfaces/httpAppLogs.interface';
import { IHttpBloqueosService } from './services/interfaces/httpBloqueos.interface';
import { IHttpComunidadesService } from './services/interfaces/httpComunidades.interface';
import { IHttpFavoritosService } from './services/interfaces/httpFavoritos.interface';
import { IHttpFotosService } from './services/interfaces/httpFotos.interface';
import { IHttpGeneralService } from './services/interfaces/httpGeneral.interface';
import { IHttpLogsService } from './services/interfaces/httpLogs.interface';
import { IHttpMensajesService } from './services/interfaces/httpMensajes.interface';
import { IHttpModeracionService } from './services/interfaces/httpModeracion.interface';
import { IHttpNoticiasService } from './services/interfaces/httpNoticias.interface';
import { IHttpParametrosService } from './services/interfaces/httpParametros.interface';
import { IHttpPerfilService } from './services/interfaces/httpPerfil.interface';
import { IHttpMiService } from './services/interfaces/httpMi.interface';
import { HttpMiService } from './services/implementations/httpMi.service';
import { IHttpPostsService } from './services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from './services/interfaces/httpSecurity.interface';
import { IHttpWebService } from './services/interfaces/httpWeb.interface';
import { IHttpUsuarioPerfilService } from './services/interfaces/httpUsuarioPerfil.interface';
import { IHttpRangosService } from './services/interfaces/httpRangos.interface';
import { IHttpComentariosPostService } from './services/interfaces/httpComentariosPost.interface';
import { DisplayComponentService } from './services/shared/displayComponents.service';
import { SEOService } from './services/shared/seo.service';
import { SeoTitleStrategy } from './services/shared/seo-title.strategy';
import { ClientErrorHandler } from './shared/errors/client-error-handler';
import { getSpanishPaginatorIntl } from './shared/helpers/getSpanishPaginatorIntl';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';

// Fechas, números y DatePipe en español (antes vivía en el constructor de AppModule).
registerLocaleData(localeEs, 'es');

// Peticiones que corren en segundo plano: no muestran el loader de pantalla completa.
// Expresiones sobre la ruta después de /api/ (`{id}` = número); se anclan al inicio y terminan en el fin o en la query.
const ID = String.raw`\d+`;
const escaparRegExp = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SIN_LOADER = [
  'favoritos',
  'favoritos/recientes',
  `favoritos/${ID}`,
  'shouts/favoritos',
  'notificaciones/recientes',
  'notificaciones/leidas',
  'notificaciones/estadisticas',
  // Mensajes: bandeja, conversación, envío, imágenes, archivar/silenciar... tienen su propio estado en pantalla
  // (el chat se refresca en vivo y el overlay lo tapaba). La tabla del admin sí lo muestra, como las demás.
  'mensajes(?!/admin)(/[^?]*)?',
  'comentarios/recientes',
  'tops/posts',
  'tops/usuarios',
  'posts/top',
  'posts/borradores',
  'posts/similares',
  'posts/sticky',
  'posts/tags',
  'noticias',
  'paginas',
  'configuracion/footer',
  'usuarios/me/presencia',
  'publicidad/[^/?]+',
  'categorias',
  'afiliados/activos',
  'fotos/top',
  'estadisticas',
  'usuarios/por-nombre/[^/?]+/(seguimiento|info|estado)',
  // Pantallas con su propio indicador (app-cargando): el overlay de pantalla completa quedaba encima del anillo.
  `posts/${ID}`,
  `posts/${ID}/comentarios`,
  `comunidades/temas/${ID}`,
  'comunidades/por-nombre/[^/?]+',
  `comunidades/${ID}/miembros`,
  'comunidades/temas/recientes',
  `fotos/${ID}`,
  'fotos',
  // Imágenes subidas desde el editor: muestra "Subiendo imagen…" donde va a quedar; el overlay de pantalla completa
  // tapaba el editor y bloqueaba los clics mientras subía.
  'fotos/imagenes',
  `fotos/${ID}/comentarios`,
  `shouts/${ID}/comentarios`,
  // Me gusta / favoritos de shouts: el botón responde al instante y el overlay lo taparía.
  `shouts/${ID}/(interacciones|me-gusta|favorito|reshout|reshouts)`,
  // Confirmación de correo y contraseña: la página y el aviso muestran su propio estado.
  'auth/email(/confirmacion|/reenvio)?',
  'auth/password(/restablecimiento)?',
  'auth/captcha',
  // /mi tiene sus propios indicadores (muro, resumen y sugerencias).
  'mi/.*',
].map((ruta) => `^${escaparRegExp(environment.api)}/api/${ruta}(\\?|$)`);

export const appConfig: ApplicationConfig = {
  providers: [
    // La app depende de zone.js (setTimeout/suscripciones que mutan estado): sin esto Angular 21 arranca zoneless.
    provideZoneChangeDetection(),
    provideRouter(routes),
    // Cada ruta publica su title/descripcion como SEO por defecto (ver app.routes).
    { provide: TitleStrategy, useClass: SeoTitleStrategy },
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    provideAnimations(),
    provideNativeDateAdapter(),
    provideToastr({
      timeOut: 6000,
      positionClass: 'toast-top-right',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    }),
    importProvidersFrom(NgxUiLoaderModule, NgxUiLoaderHttpModule.forRoot({ showForeground: true, excludeRegexp: SIN_LOADER })),

    DisplayComponentService,
    SEOService,
    Title,
    { provide: IHttpSecurityService, useClass: HttpSecurityService },
    { provide: IHttpParametrosService, useClass: HttpParametrosService },
    { provide: IHttpGeneralService, useClass: HttpGeneralService },
    { provide: IHttpPostsService, useClass: HttpPostsService },
    { provide: IHttpFavoritosService, useClass: HttpFavoritosService },
    { provide: IHttpLogsService, useClass: HttpLogsService },
    { provide: IHttpModeracionService, useClass: HttpModeracionService },
    { provide: IHttpAppLogsService, useClass: HttpAppLogsService },
    { provide: IHttpWebService, useClass: HttpWebService },
    { provide: IHttpPerfilService, useClass: HttpPerfilService },
    { provide: IHttpMiService, useClass: HttpMiService },
    { provide: IHttpNoticiasService, useClass: HttpNoticiasService },
    { provide: IHttpMensajesService, useClass: HttpMensajesService },
    { provide: IHttpFotosService, useClass: HttpFotosService },
    { provide: IHttpComunidadesService, useClass: HttpComunidadesService },
    { provide: IHttpBloqueosService, useClass: HttpBloqueosService },
    { provide: IHttpSilenciosService, useClass: HttpSilenciosService },
    { provide: IHttpUsuarioPerfilService, useClass: HttpUsuarioPerfilService },
    { provide: IHttpRangosService, useClass: HttpRangosService },
    { provide: IHttpComentariosPostService, useClass: HttpComentariosPostService },
    { provide: ErrorHandler, useClass: ClientErrorHandler },
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },
    { provide: LOCALE_ID, useValue: 'es' },
  ],
};

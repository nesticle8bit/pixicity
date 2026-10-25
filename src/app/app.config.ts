import { IHttpSilenciosService } from './services/interfaces/httpSilencios.interface';
import { HttpSilenciosService } from './services/implementations/httpSilencios.service';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

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
import { CargaGlobalInterceptor } from './shared/interceptors/carga-global.interceptor';

// Fechas, números y DatePipe en español (antes vivía en el constructor de AppModule).
registerLocaleData(localeEs, 'es');


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
    // Sin provideAnimations(): Material 21 anima con CSS y ningún componente usa @angular/animations (62 KB menos al arrancar).
    provideNativeDateAdapter(),
    provideToastr({
      timeOut: 6000,
      positionClass: 'toast-top-right',
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    }),
    { provide: HTTP_INTERCEPTORS, useClass: CargaGlobalInterceptor, multi: true },

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

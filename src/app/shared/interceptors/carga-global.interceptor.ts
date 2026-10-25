import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CargaGlobal } from '../helpers/carga-global';
import { enNavegador } from '../helpers/plataforma';

// Peticiones que corren en segundo plano: no muestran el loader de pantalla completa.
// Expresiones sobre la ruta después de /api/ (`{id}` = número); se anclan al inicio y terminan en el fin o en la query.
const ID = String.raw`\d+`;
const escaparRegExp = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const SIN_LOADER: RegExp[] = [
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
  // La portada muestra el esqueleto de la lista mientras llega.
  'portada',
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
  // Anuncios: la lista se pide al arrancar y no tiene por qué tapar la página.
  'anuncios',
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
].map((ruta) => new RegExp(`^${escaparRegExp(environment.api)}/api/${ruta}(\\?|$)`, 'i'));

/** Muestra el loader de pantalla completa (app-carga-global) mientras haya peticiones que no estén en SIN_LOADER. */
@Injectable()
export class CargaGlobalInterceptor implements HttpInterceptor {
  private carga = inject(CargaGlobal);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // En el SSR no hay pantalla y sus temporizadores demorarían el render.
    if (!enNavegador() || SIN_LOADER.some((ruta) => ruta.test(request.url))) {
      return next.handle(request);
    }

    this.carga.empezar();
    return next.handle(request).pipe(finalize(() => this.carga.terminar()));
  }
}

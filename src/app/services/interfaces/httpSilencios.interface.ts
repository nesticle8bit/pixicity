import { Observable } from 'rxjs';
import { Silencios } from 'src/app/models/seguridad/silencios.model';

/** Usuarios y palabras silenciados: no aparecen en el muro de /mi (sin bloquear a nadie). */
export abstract class IHttpSilenciosService {
  abstract getSilencios(): Observable<Silencios>;
  /** Silencia o deja de silenciar; devuelve si quedó silenciado. */
  abstract alternarUsuario(userName: string): Observable<boolean>;
  abstract agregarPalabra(palabra: string): Observable<boolean>;
  abstract quitarPalabra(id: number): Observable<boolean>;
  /** Oculta un shout del muro de /mi ("No me interesa"), o lo vuelve a mostrar. Devuelve si quedó oculto. */
  abstract ocultarShout(shoutId: number, ocultar: boolean): Observable<boolean>;
}

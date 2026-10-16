import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlcanceMuro, MiResumen, Muro, OrdenTendencias, SugerenciaUsuario, Tendencia } from 'src/app/models/mi/mi-vm.model';

/** Sección /mi: muro personal, resumen del usuario, a quién seguir y tendencias. */
@Injectable()
export abstract class IHttpMiService {
  /** Con `tag`, solo los shouts del sitio con ese #hashtag. */
  abstract getMuro(alcance: AlcanceMuro, antes: string | null, cantidad?: number, tag?: string | null): Observable<Muro>;
  abstract getResumen(): Observable<MiResumen>;
  abstract getSugerencias(cantidad?: number): Observable<SugerenciaUsuario[]>;
  abstract getTendencias(cantidad?: number, orden?: OrdenTendencias): Observable<Tendencia[]>;
  /** Autocompletado de #hashtags al escribir un shout. */
  abstract buscarHashtags(prefijo: string, cantidad?: number): Observable<Tendencia[]>;
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlcanceMuro, MiResumen, Muro, SugerenciaUsuario } from 'src/app/models/mi/mi-vm.model';

/** Sección /mi: muro personal, resumen del usuario y a quién seguir. */
@Injectable()
export abstract class IHttpMiService {
  abstract getMuro(alcance: AlcanceMuro, antes: string | null, cantidad?: number): Observable<Muro>;
  abstract getResumen(): Observable<MiResumen>;
  abstract getSugerencias(cantidad?: number): Observable<SugerenciaUsuario[]>;
}

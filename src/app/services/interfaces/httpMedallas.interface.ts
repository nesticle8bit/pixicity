import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medalla, MedallaOtorgada, MedallaUsuario, ReglaMedalla } from 'src/app/models/seguridad/medalla.model';

/** Medallas: catálogo y otorgarlas desde el panel admin; las de cada usuario en su perfil. */
@Injectable()
export abstract class IHttpMedallasService {
  abstract getCatalogo(): Observable<Medalla[]>;
  abstract guardar(medalla: Partial<Medalla>): Observable<number>;
  abstract eliminar(id: number): Observable<boolean>;
  abstract getOtorgadas(id: number): Observable<MedallaOtorgada[]>;
  abstract otorgar(id: number, userName: string, motivo: string): Observable<boolean>;
  abstract quitar(id: number, usuarioId: number): Observable<boolean>;
  abstract getMedallasUsuario(userName: string): Observable<MedallaUsuario[]>;
  abstract getReglas(): Observable<{ reglas: ReglaMedalla[]; periodos: string[] }>;
  /** Corre ahora el reparto automático (el API lo hace solo cada hora). Devuelve cuántas entregó. */
  abstract repartir(): Observable<number>;
}

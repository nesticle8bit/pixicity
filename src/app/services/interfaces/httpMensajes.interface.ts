import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpMensajesService {
  abstract getMensajes(search: any): Observable<any>;
  abstract getMensajesAdmin(search: any): Observable<any>;
  abstract getMensajesEnviados(search: any): Observable<any>;
  abstract getLastMensajes(): Observable<any>;
  abstract sendMensajePrivado(mp: any): Observable<any>;
  abstract getMensajePrivadoById(id: number): Observable<any>;
  abstract setMensajesAsReaded(): Observable<any>;
  abstract deleteMensajesById(ids: number[]): Observable<any>;
}

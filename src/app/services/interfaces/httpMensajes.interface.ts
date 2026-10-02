import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { ConversacionPage, ConversacionParams, ConversacionViewModel, MensajeViewModel, ResponseMPViewModel, SendMPViewModel } from 'src/app/models/mensajes/mensaje-vm.model';

@Injectable()
export abstract class IHttpMensajesService {
  abstract getMensajes(): Observable<PaginatedData<MensajeViewModel>>;
  abstract getMensajesAdmin(): Observable<PaginatedData<MensajeViewModel>>;
  abstract getLastMensajes(): Observable<MensajeViewModel[]>;
  abstract sendMensajePrivado(mp: SendMPViewModel): Observable<ResponseMPViewModel>;
  abstract getMensajePrivadoById(id: number): Observable<MensajeViewModel>;
  abstract getConversaciones(): Observable<{ conversaciones: ConversacionViewModel[]; pagination: any }>;
  abstract getConversacion(params: ConversacionParams): Observable<ConversacionPage>;
  abstract deleteConversaciones(otroIds: number[]): Observable<boolean>;
  abstract setMensajesAsReaded(): Observable<boolean>;
  abstract deleteMensajesById(ids: number[]): Observable<boolean>;
  abstract changeRemitente(obj: { mensajeId: number; userName: string }): Observable<boolean>;
}

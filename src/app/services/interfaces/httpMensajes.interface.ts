import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData, Pagination } from 'src/app/models/api/api-response.model';
import { BandejaConversaciones, ConversacionPage, ConversacionParams, ConversacionViewModel, MensajeViewModel, ResponseMPViewModel, SendMPViewModel } from 'src/app/models/mensajes/mensaje-vm.model';

@Injectable()
export abstract class IHttpMensajesService {
  abstract getMensajes(): Observable<PaginatedData<MensajeViewModel, 'mensajes'>>;
  abstract getMensajesAdmin(filtro?: AdminFiltro): Observable<PaginatedData<MensajeViewModel, 'mensajes'>>;
  abstract getLastMensajes(): Observable<MensajeViewModel[]>;
  /** `captcha`: token de Turnstile (lo exige el API al abrir una conversación nueva). */
  abstract sendMensajePrivado(mp: SendMPViewModel, captcha?: string | null): Observable<ResponseMPViewModel>;
  abstract getMensajePrivadoById(id: number): Observable<MensajeViewModel>;
  /** `archivadas`: la carpeta de archivadas en vez de la bandeja. */
  abstract getConversaciones(archivadas?: boolean): Observable<BandejaConversaciones>;
  abstract archivarConversaciones(otroIds: number[], archivar: boolean): Observable<boolean>;
  abstract silenciarConversacion(otroId: number, silenciar: boolean): Observable<boolean>;
  /** Sube una imagen para adjuntar a un mensaje; devuelve su URL. */
  abstract subirImagenMensaje(file: File): Observable<string>;
  abstract getConversacion(params: ConversacionParams): Observable<ConversacionPage>;
  abstract deleteConversaciones(otroIds: number[]): Observable<boolean>;
  abstract setMensajesAsReaded(): Observable<boolean>;
  abstract deleteMensajesById(ids: number[]): Observable<boolean>;
  abstract changeRemitente(obj: { mensajeId: number; userName: string }): Observable<boolean>;
}

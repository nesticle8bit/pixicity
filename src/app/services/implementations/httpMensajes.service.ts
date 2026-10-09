import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { IHttpMensajesService } from '../interfaces/httpMensajes.interface';
import { ApiResponse, PaginatedData, Pagination } from 'src/app/models/api/api-response.model';
import {
  MensajeViewModel,
  SendMPViewModel,
  ResponseMPViewModel,
  ConversacionViewModel,
  ConversacionPage,
  ConversacionParams,
} from 'src/app/models/mensajes/mensaje-vm.model';

@Injectable()
export class HttpMensajesService implements IHttpMensajesService {
  private notificationService = inject(NotificationService);
  private paginationService = inject(PaginationService);
  private helper = inject(HelperService);
  private http = inject(HttpClient);


  getMensajes(): Observable<PaginatedData<MensajeViewModel, 'mensajes'>> {
    return this.http
      .get<ApiResponse<PaginatedData<MensajeViewModel, 'mensajes'>>>(
        `${environment.api}/api/mensajes/getMensajes?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getMensajesAdmin(filtro: AdminFiltro = {}): Observable<PaginatedData<MensajeViewModel, 'mensajes'>> {
    return this.http
      .get<ApiResponse<PaginatedData<MensajeViewModel, 'mensajes'>>>(
        `${environment.api}/api/mensajes/getMensajesAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getLastMensajes(): Observable<MensajeViewModel[]> {
    return this.http
      .get<ApiResponse<MensajeViewModel[]>>(`${environment.api}/api/mensajes/getLastMensajes`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  sendMensajePrivado(mp: SendMPViewModel): Observable<ResponseMPViewModel> {
    return this.http
      .post<ApiResponse<ResponseMPViewModel>>(`${environment.api}/api/mensajes/sendMensajePrivado`, mp)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getMensajePrivadoById(id: number): Observable<MensajeViewModel> {
    return this.http
      .get<ApiResponse<MensajeViewModel>>(
        `${environment.api}/api/mensajes/getMensajePrivadoById?id=${id}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getConversaciones(): Observable<{ conversaciones: ConversacionViewModel[]; pagination: Pagination }> {
    return this.http
      .get<ApiResponse<{ conversaciones: ConversacionViewModel[]; pagination: Pagination }>>(
        `${environment.api}/api/mensajes/getConversaciones?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteConversaciones(otroIds: number[]): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/mensajes/deleteConversaciones`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: otroIds,
      })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getConversacion(params: ConversacionParams): Observable<ConversacionPage> {
    const query = new URLSearchParams();
    if (params.id) query.set('id', String(params.id));
    if (params.userName) query.set('userName', params.userName);
    if (params.antesDeId) query.set('antesDeId', String(params.antesDeId));
    if (params.take) query.set('take', String(params.take));

    return this.http
      .get<ApiResponse<ConversacionPage>>(`${environment.api}/api/mensajes/getConversacion?${query.toString()}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  setMensajesAsReaded(): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(`${environment.api}/api/mensajes/setMensajesAsReaded`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteMensajesById(ids: number[]): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/mensajes/deleteMensajes`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: ids,
      })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  changeRemitente(obj: { mensajeId: number; userName: string }): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/mensajes/changeRemitente`, obj)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}

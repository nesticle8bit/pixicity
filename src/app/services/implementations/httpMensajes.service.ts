import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { IHttpMensajesService } from '../interfaces/httpMensajes.interface';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { MensajeViewModel, SendMPViewModel, ResponseMPViewModel } from 'src/app/models/mensajes/mensaje-vm.model';

@Injectable()
export class HttpMensajesService implements IHttpMensajesService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getMensajes(): Observable<PaginatedData<MensajeViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<MensajeViewModel>>>(
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

  getMensajesAdmin(): Observable<PaginatedData<MensajeViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<MensajeViewModel>>>(
        `${environment.api}/api/mensajes/getMensajesAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

  getMensajesEnviados(): Observable<PaginatedData<MensajeViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<MensajeViewModel>>>(
        `${environment.api}/api/mensajes/getMensajesEnviados?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

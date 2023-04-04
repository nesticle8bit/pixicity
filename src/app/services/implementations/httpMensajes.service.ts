import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { PaginationService } from '../shared/pagination.service';
import { IHttpMensajesService } from '../interfaces/httpMensajes.interface';

@Injectable()
export class HttpMensajesService implements IHttpMensajesService {
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private paginationService: PaginationService
  ) {}

  getMensajes(search: any): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/mensajes/getMensajes?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getMensajesEnviados(search: any): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/mensajes/getMensajesEnviados?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getLastMensajes(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/mensajes/getLastMensajes`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  sendMensajePrivado(mp: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/mensajes/sendMensajePrivado`, mp)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getMensajePrivadoById(id: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/mensajes/getMensajePrivadoById?id=${id}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  setMensajesAsReaded(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/mensajes/setMensajesAsReaded`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteMensajesById(ids: number[]): Observable<any> {
    return this.http
      .delete<any>(`${environment.api}/api/mensajes/deleteMensajes`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: ids,
      })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}

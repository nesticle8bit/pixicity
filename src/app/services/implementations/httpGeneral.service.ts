import { IHttpGeneralService } from '../interfaces/httpGeneral.interface';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { PaginationService } from '../shared/pagination.service';

@Injectable()
export class HttpGeneralService implements IHttpGeneralService {
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private paginationService: PaginationService
  ) {}

  getEstadisticas(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/general/getEstadisticas`)
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

  getAfiliados(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/afiliados/getAfiliados`)
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

  saveAfiliacion(afiliacion: AfiliacionModel): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/afiliados/saveAfiliacion`, afiliacion)
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

  getFavoritosByUser(search: string, categoriaId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/favoritos/getFavoritos?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${search}&categoriaId=${categoriaId}`
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

  getConfiguracion(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/configuracion/getConfiguracion`)
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

  updateConfiguracion(configuracion: any): Observable<any> {
    return this.http
      .put<any>(
        `${environment.api}/api/configuracion/updateConfiguracion`,
        configuracion
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

  updateAds(configuration: any): Observable<any> {
    return this.http
      .put<any>(`${environment.api}/api/configuracion/updateAds`, configuration)
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

  updateAfiliacion(afiliacion: any): Observable<any> {
    return this.http
      .put<any>(`${environment.api}/api/afiliados/updateAfiliacion`, afiliacion)
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

  setHitInByRefCode(refCode: string): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/afiliados/setHitIn`, {
        codigo: refCode,
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

  deleteAfiliado(id: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.api}/api/afiliados/deleteAfiliado`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id },
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

  getContactos(): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/contacto/getContactos?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`
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

  saveContacto(contacto: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/contacto/saveContacto`, contacto)
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

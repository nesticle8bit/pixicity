import { IHttpNoticiasService } from '../interfaces/httpNoticias.interface';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable()
export class HttpNoticiasService implements IHttpNoticiasService {
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private paginationService: PaginationService
  ) {}

  getNoticias(search: string): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/noticias/getNoticias?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${search}`
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

  saveNoticias(noticia: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/noticias/saveNoticias`, noticia)
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

  updateNoticias(noticia: any): Observable<any> {
    return this.http
      .put<any>(`${environment.api}/api/noticias/updateNoticias`, noticia)
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

  deleteNoticias(id: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.api}/api/noticias/deleteNoticias`, {
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

  getAllNoticias(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/noticias/getAllNoticias`)
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

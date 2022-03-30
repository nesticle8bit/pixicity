import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { PaginationService } from '../shared/pagination.service';
import { IHttpLogsService } from '../interfaces/httpLogs.interface';

@Injectable()
export class HttpLogsService implements IHttpLogsService {
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private paginationService: PaginationService
  ) {}

  getNotificaciones(search: string): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/monitors/getNotificaciones?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${search}`
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
      ).pipe(catchError(this.helper.errorHandler));
  }

  getLastNotificaciones(): Observable<any> {
    return this.http
    .get<any>(
      `${environment.api}/api/monitors/getLastNotificaciones`
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
    ).pipe(catchError(this.helper.errorHandler));
  }

  setNotificacionesAsReaded(): Observable<any> {
    return this.http
    .get<any>(
      `${environment.api}/api/monitors/setNotificacionesAsReaded`
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
    ).pipe(catchError(this.helper.errorHandler));
  }

  getStats(): Observable<any> {
    return this.http
    .get<any>(
      `${environment.api}/api/monitors/getStats`
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
    ).pipe(catchError(this.helper.errorHandler));
  }
}

import { IHttpPerfilService } from '../interfaces/httpPerfil.interface';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';

@Injectable()
export class HttpPerfilService implements IHttpPerfilService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getShouts(userId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/shouts/getShouts?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&userId=${userId}`,
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getShoutsAdmin(): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/shouts/getShoutsAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  createShout(shout: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/shouts/createShout`, shout)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteShout(shoutId: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.api}/api/shouts/deleteShout`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: shoutId },
      })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  recoveryShout(shoutId: number): Observable<any> {
    return this.http
      .put<any>(`${environment.api}/api/shouts/recoveryShout`, { id: shoutId })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getShoutById(shoutId: number): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/shouts/getShoutById?id=${shoutId}`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getComentariosByShoutId(shoutId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/shouts/getComentariosByShoutId?shoutId=${shoutId}`,
      )
      .pipe(map((r: any) => (r.status === 200 ? r.data : [])))
      .pipe(catchError(this.helper.errorHandler));
  }

  addShoutComentario(model: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/shouts/addShoutComentario`, model)
      .pipe(map((r: any) => (r.status === 200 ? r.data : null)))
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteShoutComentario(id: number): Observable<any> {
    return this.http
      .delete<any>(
        `${environment.api}/api/shouts/deleteShoutComentario?id=${id}`,
      )
      .pipe(map((r: any) => (r.status === 200 ? r.data : null)))
      .pipe(catchError(this.helper.errorHandler));
  }
}

import { IHttpDenunciasService } from '../interfaces/httpDenuncias.interface';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';

@Injectable()
export class HttpDenunciasService implements IHttpDenunciasService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getDenuncias(): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/denuncias/getDenuncias?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

  deleteDenuncia(denunciaId: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.api}/api/denuncias/deleteDenuncia`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: denunciaId },
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
}

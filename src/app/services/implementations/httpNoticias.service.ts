import { IHttpNoticiasService } from '../interfaces/httpNoticias.interface';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { NoticiaModel } from 'src/app/models/web/noticia.model';

@Injectable()
export class HttpNoticiasService implements IHttpNoticiasService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getNoticias(search: string): Observable<PaginatedData<NoticiaModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<NoticiaModel>>>(
        `${environment.api}/api/noticias/getNoticias?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${search}`,
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

  saveNoticias(noticia: Partial<NoticiaModel>): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/noticias/saveNoticias`, noticia)
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

  updateNoticias(noticia: Partial<NoticiaModel>): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/noticias/updateNoticias`, noticia)
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

  deleteNoticias(id: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/noticias/deleteNoticias`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id },
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

  getAllNoticias(): Observable<NoticiaModel[]> {
    return this.http
      .get<ApiResponse<NoticiaModel[]>>(`${environment.api}/api/noticias/getAllNoticias`)
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

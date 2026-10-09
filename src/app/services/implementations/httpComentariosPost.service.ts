import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { ComentarioViewModel, ComentarioVotoResponse } from 'src/app/models/posts/post-vm.model';
import { IHttpComentariosPostService } from '../interfaces/httpComentariosPost.interface';

/** Comentarios de posts: listados, alta/edición, borrado/recuperación, votos, fijar y denunciar. */
@Injectable()
export class HttpComentariosPostService implements IHttpComentariosPostService {
  private notificationService = inject(NotificationService);
  private paginationService = inject(PaginationService);
  private helper = inject(HelperService);
  private http = inject(HttpClient);

  getComentarios(filtro: AdminFiltro = {}): Observable<PaginatedData<ComentarioViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<ComentarioViewModel>>>(
        `${environment.api}/api/comentarios/getComentarios?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
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

  getComentariosByUserId(userId: number): Observable<PaginatedData<ComentarioViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<ComentarioViewModel>>>(
        `${environment.api}/api/comentarios/getComentariosByUserId?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${userId}`,
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

  getUltimosComentarios(): Observable<ComentarioViewModel[]> {
    return this.http
      .get<ApiResponse<ComentarioViewModel[]>>(`${environment.api}/api/comentarios/getComentariosRecientes`)
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

  addComentario(comentario: Partial<ComentarioViewModel>): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/comentarios/addComentario`, comentario)
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

  updateComentario(comentario: Partial<ComentarioViewModel>): Observable<ComentarioViewModel> {
    return this.http
      .post<ApiResponse<ComentarioViewModel>>(
        `${environment.api}/api/comentarios/updateComentario`,
        comentario,
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

  getComentariosByPostId(postId: number): Observable<ComentarioViewModel[]> {
    return this.http
      .get<ApiResponse<ComentarioViewModel[]>>(
        `${environment.api}/api/comentarios/getComentariosByPostId?postId=${postId}`,
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

  recuperarComentario(comentarioId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/comentarios/recuperarComentario`, { id: comentarioId })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data;
          }
          this.notificationService.error(response.errors.join(', '), 'Error');
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  deleteComentario(comentarioId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/comentarios/deleteComentario`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: comentarioId },
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

  votarComentario(comentarioId: number, cantidad: number): Observable<ComentarioVotoResponse> {
    return this.http
      .post<ApiResponse<ComentarioVotoResponse>>(`${environment.api}/api/comentarios/votarComentario`, {
        comentarioId,
        cantidad,
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

  fijarComentario(comentarioId: number): Observable<boolean> {
    return this.unwrapData(
      this.http.post<ApiResponse<boolean>>(`${environment.api}/api/comentarios/fijarComentario?comentarioId=${comentarioId}`, {}),
    );
  }

  denunciarComentario(comentarioId: number, motivo: string): Observable<boolean> {
    return this.unwrapData(
      this.http.post<ApiResponse<boolean>>(`${environment.api}/api/comentarios/denunciarComentario?comentarioId=${comentarioId}`, { motivo }),
    );
  }

  private unwrapData<T>(obs: Observable<ApiResponse<T>>): Observable<T> {
    return obs.pipe(
      map((response) => {
        if (response.status === 200) {
          return response.data!;
        }
        this.notificationService.error(response.errors?.join(', ') ?? 'Error', 'Error');
        throw new Error(response.errors?.join(', ') ?? 'Error');
      }),
      catchError(this.helper.errorHandler),
    );
  }
}

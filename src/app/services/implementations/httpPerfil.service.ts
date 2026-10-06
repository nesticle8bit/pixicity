import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { IHttpPerfilService } from '../interfaces/httpPerfil.interface';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { ShoutAdmin, ShoutComentarioViewModel, ShoutComentarioVoto, ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';

@Injectable()
export class HttpPerfilService implements IHttpPerfilService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getShouts(userId: number): Observable<PaginatedData<ShoutViewModel, 'shouts'>> {
    return this.http
      .get<ApiResponse<PaginatedData<ShoutViewModel, 'shouts'>>>(
        `${environment.api}/api/shouts/getShouts?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&userId=${userId}`,
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

  getTopShouts(count: number = 6): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${environment.api}/api/shouts/getTopShouts?count=${count}`)
      .pipe(
        map((response) => (response.status === 200 ? response.data! : [])),
        catchError(this.helper.errorHandler)
      );
  }

  getShoutsAdmin(filtro: AdminFiltro = {}): Observable<PaginatedData<ShoutAdmin, 'shouts'>> {
    return this.http
      .get<ApiResponse<PaginatedData<ShoutAdmin, 'shouts'>>>(
        `${environment.api}/api/shouts/getShoutsAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
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

  createShout(shout: Partial<ShoutViewModel>): Observable<ShoutViewModel> {
    return this.http
      .post<ApiResponse<ShoutViewModel>>(`${environment.api}/api/shouts/createShout`, shout)
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

  deleteShout(shoutId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/shouts/deleteShout`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: shoutId },
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

  recoveryShout(shoutId: number): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/shouts/recoveryShout`, { id: shoutId })
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

  getShoutById(shoutId: number): Observable<ShoutViewModel> {
    return this.http
      .get<ApiResponse<ShoutViewModel>>(`${environment.api}/api/shouts/getShoutById?id=${shoutId}`)
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

  getComentariosByShoutId(shoutId: number): Observable<ShoutComentarioViewModel[]> {
    return this.http
      .get<ApiResponse<ShoutComentarioViewModel[]>>(
        `${environment.api}/api/shouts/getComentariosByShoutId?shoutId=${shoutId}`,
      )
      .pipe(map((r) => (r.status === 200 ? r.data! : [])))
      .pipe(catchError(this.helper.errorHandler));
  }

  addShoutComentario(model: { shoutId: number; comentario: string; parentId?: number }): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/shouts/addShoutComentario`, model)
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteShoutComentario(id: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(
        `${environment.api}/api/shouts/deleteShoutComentario?id=${id}`,
      )
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  votarShoutComentario(comentarioId: number, valor: number): Observable<ShoutComentarioVoto> {
    return this.http
      .post<ApiResponse<ShoutComentarioVoto>>(`${environment.api}/api/shouts/votarShoutComentario?comentarioId=${comentarioId}&valor=${valor}`, {})
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  editarShoutComentario(comentarioId: number, contenido: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/shouts/editarShoutComentario?comentarioId=${comentarioId}`, { contenido })
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  fijarShoutComentario(comentarioId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/shouts/fijarShoutComentario?comentarioId=${comentarioId}`, {})
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  denunciarShoutComentario(comentarioId: number, motivo: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/shouts/denunciarShoutComentario?comentarioId=${comentarioId}`, { motivo })
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }
}

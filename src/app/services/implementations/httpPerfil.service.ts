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
import { ShoutViewModel, ShoutComentarioViewModel } from 'src/app/models/perfil/shout-vm.model';

@Injectable()
export class HttpPerfilService implements IHttpPerfilService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getShouts(userId: number): Observable<PaginatedData<ShoutViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<ShoutViewModel>>>(
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

  getShoutsAdmin(): Observable<PaginatedData<ShoutViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<ShoutViewModel>>>(
        `${environment.api}/api/shouts/getShoutsAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

  addShoutComentario(model: Partial<ShoutComentarioViewModel>): Observable<ShoutComentarioViewModel> {
    return this.http
      .post<ApiResponse<ShoutComentarioViewModel>>(`${environment.api}/api/shouts/addShoutComentario`, model)
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

  votarShoutComentario(comentarioId: number, valor: number): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${environment.api}/api/shouts/votarShoutComentario?comentarioId=${comentarioId}&valor=${valor}`, {})
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  editarShoutComentario(comentarioId: number, contenido: string): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${environment.api}/api/shouts/editarShoutComentario?comentarioId=${comentarioId}`, { contenido })
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  fijarShoutComentario(comentarioId: number): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${environment.api}/api/shouts/fijarShoutComentario?comentarioId=${comentarioId}`, {})
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  denunciarShoutComentario(comentarioId: number, motivo: string): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${environment.api}/api/shouts/denunciarShoutComentario?comentarioId=${comentarioId}`, { motivo })
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  getDenunciasShoutComentarios(page: number, pageCount: number, soloPendientes: boolean = false): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${environment.api}/api/shouts/getDenunciasShoutComentarios?page=${page}&pageCount=${pageCount}&soloPendientes=${soloPendientes}`)
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  resolverDenunciaShoutComentario(denunciaId: number): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${environment.api}/api/shouts/resolverDenunciaShoutComentario?denunciaId=${denunciaId}`, {})
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  eliminarDenunciaShoutComentario(denunciaId: number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${environment.api}/api/shouts/eliminarDenunciaShoutComentario?denunciaId=${denunciaId}`)
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }
}

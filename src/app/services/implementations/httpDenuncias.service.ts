import { IHttpDenunciasService } from '../interfaces/httpDenuncias.interface';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';

interface DenunciaViewModel {
  id: number;
  fechaRegistro: string;
  razon: string;
  postId: number;
  usuarioId: number;
  gestionada: boolean;
  postTitulo?: string;
  userName?: string;
}

@Injectable()
export class HttpDenunciasService implements IHttpDenunciasService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getDenuncias(): Observable<PaginatedData<DenunciaViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<DenunciaViewModel>>>(
        `${environment.api}/api/denuncias/getDenuncias?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

  getDenunciasCount(): Observable<number> {
    return this.http
      .get<ApiResponse<number>>(`${environment.api}/api/denuncias/getDenunciasCount`)
      .pipe(map((r) => (r.status === 200 ? (r.data ?? 0) : 0)))
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteDenuncia(denunciaId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/denuncias/deleteDenuncia`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: denunciaId },
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
}

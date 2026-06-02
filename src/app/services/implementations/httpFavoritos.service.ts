import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { IHttpFavoritosService } from '../interfaces/httpFavoritos.interface';
import { PaginationService } from '../shared/pagination.service';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse } from 'src/app/models/api/api-response.model';
import { FavoritosViewModel } from 'src/app/models/posts/post-vm.model';
import { CategoriaViewModel } from 'src/app/models/parametros/parametros-vm.model';

@Injectable()
export class HttpFavoritosService implements IHttpFavoritosService {
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private paginationService: PaginationService,
    private notificationService: NotificationService
  ) {}

  getLastFavoritos(count: number): Observable<FavoritosViewModel[]> {
    return this.http
      .get<ApiResponse<FavoritosViewModel[]>>(`${environment.api}/api/favoritos/getLastFavoritos?count=${count}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteFavorito(favoritoId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/favoritos/deleteFavorito?favoritoId=${favoritoId}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getCategorias(): Observable<CategoriaViewModel[]> {
    return this.http
      .get<ApiResponse<CategoriaViewModel[]>>(`${environment.api}/api/favoritos/getCategorias`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}

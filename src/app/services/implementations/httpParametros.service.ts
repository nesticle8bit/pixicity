import { IHttpParametrosService } from '../interfaces/httpParametros.interface';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { CategoriaViewModel, PaisViewModel, EstadoViewModel } from 'src/app/models/parametros/parametros-vm.model';

@Injectable()
export class HttpParametrosService implements IHttpParametrosService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getPaises(): Observable<PaginatedData<PaisViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<PaisViewModel>>>(
        `${environment.api}/api/paises/getPaises?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

  getPaisesDropdown(): Observable<PaisViewModel[]> {
    return this.http
      .get<ApiResponse<PaisViewModel[]>>(`${environment.api}/api/paises/getPaisesDropdown`)
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

  savePais(pais: Partial<PaisViewModel>): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/paises/savePais`, pais)
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

  updatePais(pais: PaisViewModel): Observable<number> {
    return this.http
      .put<ApiResponse<number>>(`${environment.api}/api/paises/updatePais`, pais)
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

  getEstadosByPais(idPais: number): Observable<EstadoViewModel[]> {
    return this.http
      .get<ApiResponse<EstadoViewModel[]>>(
        `${environment.api}/api/paises/getEstadosByPais?idPais=${idPais}`,
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

  getCategoriasAdmin(): Observable<PaginatedData<CategoriaViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<CategoriaViewModel>>>(
        `${environment.api}/api/categorias/getCategoriasAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

  getCategoriasDropdown(): Observable<CategoriaViewModel[]> {
    return this.http
      .get<ApiResponse<CategoriaViewModel[]>>(`${environment.api}/api/categorias/getCategoriasDropdown`)
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

  saveCategoria(categoria: Partial<CategoriaViewModel>): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/categorias/saveCategoria`, categoria)
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

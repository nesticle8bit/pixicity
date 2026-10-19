import { CategoriaAdmin, PaisAdmin } from 'src/app/models/admin/filas-admin.model';
import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { IHttpParametrosService } from '../interfaces/httpParametros.interface';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { CategoriaViewModel, CensuraViewModel, PaisViewModel, EstadoViewModel, TopCategoriaViewModel } from 'src/app/models/parametros/parametros-vm.model';

@Injectable()
export class HttpParametrosService implements IHttpParametrosService {
  private notificationService = inject(NotificationService);
  private paginationService = inject(PaginationService);
  private helper = inject(HelperService);
  private http = inject(HttpClient);


  getPaises(filtro: AdminFiltro = {}): Observable<PaginatedData<PaisAdmin>> {
    return this.http
      .get<ApiResponse<PaginatedData<PaisAdmin>>>(
        `${environment.api}/api/paises/admin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
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
      .get<ApiResponse<PaisViewModel[]>>(`${environment.api}/api/paises`)
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
      .post<ApiResponse<number>>(`${environment.api}/api/paises`, pais)
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
      .put<ApiResponse<number>>(`${environment.api}/api/paises/${pais.id}`, pais)
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
        `${environment.api}/api/paises/${idPais}/estados`,
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

  getCategoriasAdmin(filtro: AdminFiltro = {}): Observable<PaginatedData<CategoriaAdmin, 'categorias'>> {
    return this.http
      .get<ApiResponse<PaginatedData<CategoriaAdmin, 'categorias'>>>(
        `${environment.api}/api/categorias/admin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
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
      .get<ApiResponse<CategoriaViewModel[]>>(`${environment.api}/api/categorias`)
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

  getTopCategorias(count: number = 10): Observable<TopCategoriaViewModel[]> {
    return this.http
      .get<ApiResponse<TopCategoriaViewModel[]>>(`${environment.api}/api/categorias/top?count=${count}`)
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

  /** Alterna eliminada/activa; devuelve true si quedó eliminada. */
  cambiarEstadoCategoria(id: number): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/categorias/${id}/estado`, null)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          }
          this.notificationService.error(response.errors.join(', '), 'Error');
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler),
      );
  }

  saveCategoria(categoria: Partial<CategoriaViewModel>): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/categorias`, categoria)
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

  getCensuras(filtro: AdminFiltro = {}): Observable<PaginatedData<CensuraViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<CensuraViewModel>>>(
        `${environment.api}/api/censuras?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
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

  saveCensura(censura: CensuraViewModel): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/censuras`, censura)
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

  deleteCensura(id: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/censuras/${id}`)
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

import { IHttpGeneralService } from '../interfaces/httpGeneral.interface';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { EstadisticasViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { FavoritosViewModel } from 'src/app/models/posts/post-vm.model';

@Injectable()
export class HttpGeneralService implements IHttpGeneralService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

  getAdminEstadisticas(): Observable<unknown> {
    return this.http
      .get<ApiResponse<unknown>>(`${environment.api}/api/general/getAdminEstadisticas`)
      .pipe(
        map((response) =>
          response.status === 200 ? response.data : null,
        ),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getEstadisticas(): Observable<EstadisticasViewModel> {
    return this.http
      .get<ApiResponse<EstadisticasViewModel>>(`${environment.api}/api/general/getEstadisticas`)
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

  getAfiliados(): Observable<AfiliacionModel[]> {
    return this.http
      .get<ApiResponse<AfiliacionModel[]>>(`${environment.api}/api/afiliados/getAfiliados`)
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

  saveAfiliacion(afiliacion: AfiliacionModel): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/afiliados/saveAfiliacion`, afiliacion)
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

  getFavoritosByUser(search: string, categoriaId: number): Observable<PaginatedData<FavoritosViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<FavoritosViewModel>>>(
        `${environment.api}/api/favoritos/getFavoritos?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${search}&categoriaId=${categoriaId}`,
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

  getConfiguracion(): Observable<unknown> {
    return this.http
      .get<ApiResponse<unknown>>(`${environment.api}/api/configuracion/getConfiguracion`)
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

  updateConfiguracion(configuracion: unknown): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(
        `${environment.api}/api/configuracion/updateConfiguracion`,
        configuracion,
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

  updateAds(configuration: unknown): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/configuracion/updateAds`, configuration)
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

  updateAfiliacion(afiliacion: AfiliacionModel): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/afiliados/updateAfiliacion`, afiliacion)
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

  setHitInByRefCode(refCode: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/afiliados/setHitIn`, {
        codigo: refCode,
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

  deleteAfiliado(id: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/afiliados/deleteAfiliado`, {
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

  getContactos(): Observable<unknown> {
    return this.http
      .get<ApiResponse<unknown>>(
        `${environment.api}/api/contacto/getContactos?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

  saveContacto(contacto: unknown): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/contacto/saveContacto`, contacto)
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

  gestionarContacto(contactoId: number): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/contacto/gestionarContacto`, {
        id: contactoId,
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

  deleteContacto(contactoId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/contacto/deleteContacto`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: contactoId },
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

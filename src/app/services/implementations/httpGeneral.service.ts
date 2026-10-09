import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { ConfiguracionModel, ContactoModel } from 'src/app/models/general/configuracion.model';
import { IHttpGeneralService } from '../interfaces/httpGeneral.interface';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { ApiResponse, PaginatedData, PaginatedWithCategorias } from 'src/app/models/api/api-response.model';
import { EstadisticasViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { FavoritosViewModel } from 'src/app/models/posts/post-vm.model';
import { DashboardResumen } from 'src/app/models/admin/dashboard.model';

@Injectable()
export class HttpGeneralService implements IHttpGeneralService {
  private notificationService = inject(NotificationService);
  private paginationService = inject(PaginationService);
  private helper = inject(HelperService);
  private http = inject(HttpClient);


  getDashboardResumen(): Observable<DashboardResumen> {
    return this.http
      .get<ApiResponse<DashboardResumen>>(`${environment.api}/api/dashboard/getResumen`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

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

  getAfiliados(filtro: AdminFiltro = {}): Observable<PaginatedData<AfiliacionModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<AfiliacionModel>>>(`${environment.api}/api/afiliados/getAfiliados`, { params: adminParams(filtro, this.paginationService) })
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

  getFavoritosByUser(search: string, categoriaId: number): Observable<PaginatedWithCategorias<FavoritosViewModel, 'favoritos'>> {
    return this.http
      .get<ApiResponse<PaginatedWithCategorias<FavoritosViewModel, 'favoritos'>>>(
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

  getConfiguracion(): Observable<ConfiguracionModel> {
    return this.http
      .get<ApiResponse<ConfiguracionModel>>(`${environment.api}/api/configuracion/getConfiguracion`)
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

  updateConfiguracion(configuracion: Partial<ConfiguracionModel>): Observable<boolean> {
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

  updateAds(configuration: Partial<ConfiguracionModel>): Observable<boolean> {
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

  getContactos(filtro: AdminFiltro = {}): Observable<PaginatedData<ContactoModel, 'contactos'>> {
    return this.http
      .get<ApiResponse<PaginatedData<ContactoModel, 'contactos'>>>(
        `${environment.api}/api/contacto/getContactos?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
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

  getContactosPendientes(): Observable<number> {
    return this.http
      .get<ApiResponse<number>>(`${environment.api}/api/contacto/getContactosPendientes`)
      .pipe(map((r) => (r.status === 200 ? (r.data ?? 0) : 0)))
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

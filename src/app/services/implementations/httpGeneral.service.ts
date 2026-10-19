import { AfiliadoAdmin, ContactoAdmin } from 'src/app/models/admin/filas-admin.model';
import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { ConfiguracionModel, ContactoModel } from 'src/app/models/general/configuracion.model';
import { IHttpGeneralService } from '../interfaces/httpGeneral.interface';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { ApiResponse, PaginatedData, PaginatedWithCategorias } from 'src/app/models/api/api-response.model';
import { EstadisticasViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { FavoritoPostLista } from 'src/app/models/posts/post-vm.model';
import { DashboardResumen, MetricasApi } from 'src/app/models/admin/dashboard.model';

@Injectable()
export class HttpGeneralService implements IHttpGeneralService {
  private notificationService = inject(NotificationService);
  private paginationService = inject(PaginationService);
  private helper = inject(HelperService);
  private http = inject(HttpClient);


  getDashboardResumen(): Observable<DashboardResumen> {
    return this.http
      .get<ApiResponse<DashboardResumen>>(`${environment.api}/api/dashboard/resumen`)
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

  getMetricasApi(minutos: number): Observable<MetricasApi> {
    return this.http
      .get<ApiResponse<MetricasApi>>(`${environment.api}/api/dashboard/metricas`, { params: { minutos } })
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
      .get<ApiResponse<unknown>>(`${environment.api}/api/estadisticas/admin`)
      .pipe(
        map((response) =>
          response.status === 200 ? response.data : null,
        ),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getEstadisticas(): Observable<EstadisticasViewModel> {
    return this.http
      .get<ApiResponse<EstadisticasViewModel>>(`${environment.api}/api/estadisticas`)
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

  getAfiliados(filtro: AdminFiltro = {}): Observable<PaginatedData<AfiliadoAdmin>> {
    return this.http
      .get<ApiResponse<PaginatedData<AfiliadoAdmin>>>(`${environment.api}/api/afiliados`, { params: adminParams(filtro, this.paginationService) })
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
      .post<ApiResponse<number>>(`${environment.api}/api/afiliados`, afiliacion)
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

  getFavoritosByUser(
    search: string,
    categoriaId: number,
    page: number,
    pageCount: number,
  ): Observable<PaginatedWithCategorias<FavoritoPostLista, 'favoritos'>> {
    return this.http
      .get<ApiResponse<PaginatedWithCategorias<FavoritoPostLista, 'favoritos'>>>(
        `${environment.api}/api/favoritos?page=${page}&pageCount=${pageCount}&query=${encodeURIComponent(search ?? '')}&categoriaId=${categoriaId}`,
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
      .get<ApiResponse<ConfiguracionModel>>(`${environment.api}/api/configuracion`)
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
        `${environment.api}/api/configuracion`,
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

  updatePublicidad(configuration: Partial<ConfiguracionModel>): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/publicidad`, configuration)
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

  updateAfiliacion(afiliacion: AfiliacionModel & { id: number }): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/afiliados/${afiliacion.id}`, afiliacion)
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
      .post<ApiResponse<boolean>>(`${environment.api}/api/afiliados/entradas`, {
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
      .delete<ApiResponse<boolean>>(`${environment.api}/api/afiliados/${id}`)
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

  getContactos(filtro: AdminFiltro = {}): Observable<PaginatedData<ContactoAdmin, 'contactos'>> {
    return this.http
      .get<ApiResponse<PaginatedData<ContactoAdmin, 'contactos'>>>(
        `${environment.api}/api/contactos?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
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
      .get<ApiResponse<number>>(`${environment.api}/api/contactos/pendientes`)
      .pipe(map((r) => (r.status === 200 ? (r.data ?? 0) : 0)))
      .pipe(catchError(this.helper.errorHandler));
  }

  saveContacto(contacto: unknown): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/contactos`, contacto)
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
      .put<ApiResponse<boolean>>(`${environment.api}/api/contactos/${contactoId}/gestion`, {})
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
      .delete<ApiResponse<boolean>>(`${environment.api}/api/contactos/${contactoId}`)
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

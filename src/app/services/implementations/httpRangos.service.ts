import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { RangoUsuarioReportViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { DropdownViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { IHttpRangosService } from '../interfaces/httpRangos.interface';

/** Rangos de usuario: listado, alta/edición, asignación manual y recálculo por puntos. */
@Injectable()
export class HttpRangosService implements IHttpRangosService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  private paginationService = inject(PaginationService);
  private notificationService = inject(NotificationService);

  getRangosUsuarios(filtro: AdminFiltro = {}): Observable<PaginatedData<unknown, 'rangos'>> {
    return this.http
      .get<ApiResponse<PaginatedData<unknown, 'rangos'>>>(`${environment.api}/api/rangos/getRangosUsuarios`, { params: adminParams(filtro, this.paginationService) })
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

  getRangosDropdown(): Observable<DropdownViewModel[]> {
    return this.http
      .get<ApiResponse<DropdownViewModel[]>>(`${environment.api}/api/rangos/getRangosDropdown`)
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

  addUpdateRango(rango: unknown): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/rangos/addUpdateRango`, rango)
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

  changeRango(rangoUsuario: { userId: number; rangoId: number }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(
        `${environment.api}/api/rangos/changeRangoUsuario`,
        rangoUsuario
      )
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

  changeUsuariosRangosByPuntos(): Observable<RangoUsuarioReportViewModel[]> {
    return this.http
      .get<ApiResponse<RangoUsuarioReportViewModel[]>>(`${environment.api}/api/rangos/changeUsuariosRangosByPuntos`)
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

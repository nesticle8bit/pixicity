import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { PerfilInfoResponse, PerfilUsuarioViewModel, SeguidoresResponse, UsuarioAvatarViewModel, UsuarioInfoViewModel, FondoPerfilRequest } from 'src/app/models/seguridad/seguridad-vm.model';
import { ActividadLogsViewModel } from 'src/app/models/logs/logs-vm.model';
import { IHttpUsuarioPerfilService } from '../interfaces/httpUsuarioPerfil.interface';

/** Perfil de usuarios: info pública, perfil extendido, seguidores, avatar, fondo, actividad y estado en línea. */
@Injectable()
export class HttpUsuarioPerfilService implements IHttpUsuarioPerfilService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  private paginationService = inject(PaginationService);
  private notificationService = inject(NotificationService);

  sugerirMenciones(prefijo: string): Observable<UsuarioAvatarViewModel[]> {
    // Silencioso: es una ayuda mientras se escribe; un fallo no debe mostrar errores.
    return this.http
      .get<ApiResponse<UsuarioAvatarViewModel[]>>(`${environment.api}/api/usuarios/menciones`, { params: { q: prefijo } })
      .pipe(
        map((response) => (response.status === 200 ? response.data ?? [] : [])),
        catchError(() => of([])),
      );
  }

  getUsuarioInfo(userName: string): Observable<UsuarioInfoViewModel> {
    return this.http
      .get<ApiResponse<UsuarioInfoViewModel>>(
        `${environment.api}/api/usuarios/por-nombre/${encodeURIComponent(userName)}/info`
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

  seguirUsuario(usuario: { userName: string }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/usuarios/seguimientos`, usuario)
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

  isFollowingTheUser(userName: string): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(
        `${environment.api}/api/usuarios/por-nombre/${encodeURIComponent(userName)}/seguimiento`
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

  getFollowingUsersByUserId(id: number): Observable<PaginatedData<UsuarioAvatarViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<UsuarioAvatarViewModel>>>(
        `${environment.api}/api/usuarios/seguidos?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${id}`
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

  getFollowersByUserId(userId: number): Observable<PaginatedData<UsuarioAvatarViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<UsuarioAvatarViewModel>>>(
        `${environment.api}/api/usuarios/seguidores?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${userId}`
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

  getLastFollowersByUserId(userId: number): Observable<SeguidoresResponse> {
    return this.http
      .get<ApiResponse<SeguidoresResponse>>(
        `${environment.api}/api/usuarios/${userId}/seguidores/recientes`
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

  savePerfilInfo(perfil: Partial<PerfilUsuarioViewModel>): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/usuarios/me/perfil`, perfil)
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

  getCurrentPerfilInfo(): Observable<PerfilInfoResponse> {
    return this.http
      .get<ApiResponse<PerfilInfoResponse>>(`${environment.api}/api/usuarios/me/perfil`)
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

  getPerfilInfoByUserId(userId: number): Observable<PerfilUsuarioViewModel> {
    return this.http
      .get<ApiResponse<PerfilUsuarioViewModel>>(
        `${environment.api}/api/usuarios/${userId}/perfil`
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

  getSocialMediaByUsuarioId(usuarioId: number): Observable<unknown> {
    return this.http
      .get<ApiResponse<unknown>>(
        `${environment.api}/api/usuarios/${usuarioId}/redes`
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

  changeAvatar(file: Blob): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('avatar.jpeg', file);

    return this.http
      .put<ApiResponse<string>>(`${environment.api}/api/usuarios/me/avatar`, formData)
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

  exportarMisDatos(): Observable<Blob> {
    return this.http.get(`${environment.api}/api/usuarios/me/exportacion`, { responseType: 'blob' });
  }

  getActividadUsuario(usuarioId: number, tipoActividad: number): Observable<ActividadLogsViewModel> {
    return this.http
      .get<ApiResponse<ActividadLogsViewModel>>(
        `${environment.api}/api/usuarios/${usuarioId}/actividad?tipoActividad=${tipoActividad}`
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

  changeBackgroundProfile(obj: FondoPerfilRequest): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/usuarios/me/fondo`, obj)
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

  getUserStatus(userName: string): Observable<number | null> {
    return this.http
      .get<ApiResponse<number | null>>(
        `${environment.api}/api/usuarios/por-nombre/${encodeURIComponent(userName)}/estado`
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
}

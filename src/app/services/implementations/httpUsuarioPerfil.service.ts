import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { PerfilInfoResponse, PerfilUsuarioViewModel, SeguidoresResponse, UsuarioAvatarViewModel, UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { ActividadViewModel } from 'src/app/models/logs/logs-vm.model';
import { IHttpUsuarioPerfilService } from '../interfaces/httpUsuarioPerfil.interface';

/** Perfil de usuarios: info pública, perfil extendido, seguidores, avatar, fondo, actividad y estado en línea. */
@Injectable()
export class HttpUsuarioPerfilService implements IHttpUsuarioPerfilService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  private paginationService = inject(PaginationService);
  private notificationService = inject(NotificationService);

  getUsuarioInfo(userName: string): Observable<UsuarioInfoViewModel> {
    return this.http
      .get<ApiResponse<UsuarioInfoViewModel>>(
        `${environment.api}/api/usuarios/getUsuarioInfo?userName=${userName}`
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
      .post<ApiResponse<boolean>>(`${environment.api}/api/usuarios/seguirUsuario`, usuario)
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
        `${environment.api}/api/usuarios/isFollowingTheUser?userName=${userName}`
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
        `${environment.api}/api/usuarios/getFollowingUsersByUserId?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${id}`
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
        `${environment.api}/api/usuarios/getFollowersByUserId?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${userId}`
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
        `${environment.api}/api/usuarios/getLastFollowersByUserId?userId=${userId}`
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
      .put<ApiResponse<boolean>>(`${environment.api}/api/usuarios/savePerfilInfo`, perfil)
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
      .get<ApiResponse<PerfilInfoResponse>>(`${environment.api}/api/usuarios/getCurrentPerfilInfo`)
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
        `${environment.api}/api/usuarios/getPerfilInfoByUserId?usuarioId=${userId}`
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
        `${environment.api}/api/usuarios/getSocialMediaByUsuarioId?usuarioId=${usuarioId}`
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
      .post<ApiResponse<string>>(`${environment.api}/api/usuarios/changeAvatar`, formData)
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

  getActividadUsuario(usuarioId: number, tipoActividad: number): Observable<ActividadViewModel[]> {
    return this.http
      .get<ApiResponse<ActividadViewModel[]>>(
        `${environment.api}/api/usuarios/getActividadUsuario?usuarioId=${usuarioId}&tipoActividad=${tipoActividad}`
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

  changeBackgroundProfile(obj: { imageUrl: string }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/usuarios/changeBackgroundProfile`, obj)
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
        `${environment.api}/api/usuarios/getUserStatus?userName=${userName}`
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

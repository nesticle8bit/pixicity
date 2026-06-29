import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { PaginationService } from '../shared/pagination.service';
import { UserModel } from 'src/app/models/security/user.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { PerfilUsuarioViewModel, UsuarioViewModel, UsuarioAvatarViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { ActividadViewModel } from 'src/app/models/logs/logs-vm.model';
import { DropdownViewModel } from 'src/app/models/parametros/parametros-vm.model';

interface UsuarioSearchFilter {
  genero?: string;
  pais?: string;
  rango?: string;
}

interface UsuarioAdminSearchFilter {
  rangoId?: number;
}

@Injectable()
export class HttpSecurityService implements IHttpSecurityService {
  public currentUser: Observable<JwtUserModel>;
  private currentUserSubject: BehaviorSubject<JwtUserModel>;

  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private router: Router,
    private paginationService: PaginationService,
    private notificationService: NotificationService
  ) {
    this.currentUserSubject = new BehaviorSubject<JwtUserModel>(
      JSON.parse(localStorage.getItem('taringas') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  registerUser(user: UserModel): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/usuarios/registrarUsuario`, user)
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

  loginUser(user: { userName: string; password: string }): Observable<JwtUserModel> {
    return this.http
      .post<ApiResponse<JwtUserModel>>(`${environment.api}/api/usuarios/login`, user)
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

  // Intercambia el refresh token por un nuevo access token (rotación) y actualiza el storage.
  refreshAccessToken(): Observable<string> {
    const currentUser = this.currentUserSubject.value;
    const refreshToken = currentUser?.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token'));
    }

    return this.http
      .post<ApiResponse<{ token: string; refreshToken: string }>>(
        `${environment.api}/api/usuarios/refreshToken`,
        { refreshToken }
      )
      .pipe(
        map((response) => {
          if (response.status === 200 && response.data?.token) {
            const updated = new JwtUserModel(
              currentUser.usuario,
              response.data.token,
              response.data.refreshToken
            );
            this.setUserToLocalStorage(updated);
            return response.data.token;
          }
          throw new Error(response.errors?.join(', ') ?? 'No se pudo refrescar la sesión');
        })
      );
  }

  getCurrentUser(): JwtUserModel {
    return this.currentUserSubject.value;
  }

  getCurrentUserAsObservable(): Observable<JwtUserModel> {
    return this.currentUserSubject.asObservable();
  }

  getUsuarios(search: UsuarioSearchFilter): Observable<PaginatedData<UsuarioViewModel>> {
    let searchParams = ``;

    if (search?.genero) {
      searchParams += `&genero=${search.genero}`;
    }

    if (search?.pais) {
      searchParams += `&pais=${search.pais}`;
    }

    if (search?.rango) {
      searchParams += `&rango=${search.rango}`;
    }

    return this.http
      .get<ApiResponse<PaginatedData<UsuarioViewModel>>>(
        `${environment.api}/api/usuarios/getUsuarios?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${searchParams}`
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

  getUsuariosAdmin(search: UsuarioAdminSearchFilter): Observable<PaginatedData<UsuarioViewModel>> {
    let searchParams = ``;

    if (search?.rangoId) {
      searchParams += `&rango=${search.rangoId}`;
    }

    return this.http
      .get<ApiResponse<PaginatedData<UsuarioViewModel>>>(
        `${environment.api}/api/usuarios/getUsuariosAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${searchParams}`
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

  getLoggedUserByJwt(): Observable<PerfilUsuarioViewModel> {
    return this.http
      .get<ApiResponse<PerfilUsuarioViewModel>>(`${environment.api}/api/usuarios/getLoggedUserByJwt`)
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

  getUserByUserName(userName: string): Observable<PerfilUsuarioViewModel> {
    return this.http
      .get<ApiResponse<PerfilUsuarioViewModel>>(
        `${environment.api}/api/usuarios/getUserByUserName?userName=${userName}`
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

  getSesiones(): Observable<PaginatedData<unknown>> {
    return this.http
      .get<ApiResponse<PaginatedData<unknown>>>(
        `${environment.api}/api/usuarios/getSesiones?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`
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

  deleteSessionById(sessionId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(
        `${environment.api}/api/usuarios/deleteSesion?id=${sessionId}`
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

  setUserToLocalStorage(obj: JwtUserModel): void {
    localStorage.setItem('taringas', JSON.stringify(obj));
    this.currentUserSubject.next(obj);
  }

  logout(): void {
    localStorage.removeItem('taringas');

    this.router.navigateByUrl('');
    this.currentUserSubject.next(new JwtUserModel({}, ''));
  }

  changePassword(obj: { currentPassword: string; newPassword: string }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/usuarios/changeUserPassword`, obj)
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

  updateUsuario(usuario: UsuarioViewModel): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/usuarios/updateUsuario`, usuario)
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

  getUsuarioInfo(userName: string): Observable<PerfilUsuarioViewModel> {
    return this.http
      .get<ApiResponse<PerfilUsuarioViewModel>>(
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

  getLastFollowersByUserId(userId: number): Observable<UsuarioAvatarViewModel[]> {
    return this.http
      .get<ApiResponse<UsuarioAvatarViewModel[]>>(
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

  getCurrentPerfilInfo(): Observable<PerfilUsuarioViewModel> {
    return this.http
      .get<ApiResponse<PerfilUsuarioViewModel>>(`${environment.api}/api/usuarios/getCurrentPerfilInfo`)
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

  banUser(usuario: { userName: string; razon?: string }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/usuarios/banUser`, usuario)
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

  changeAvatarAdmin(file: Blob, usuarioId: number): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('avatar.jpeg', file);
    formData.append('usuarioId', usuarioId.toString());

    return this.http
      .post<ApiResponse<string>>(`${environment.api}/api/usuarios/changeAvatarAdmin`, formData)
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

  getLastRegisteredUsers(): Observable<UsuarioViewModel[]> {
    return this.http
      .get<ApiResponse<UsuarioViewModel[]>>(`${environment.api}/api/usuarios/getLastRegisteredUsers`)
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

  getRangosUsuarios(): Observable<PaginatedData<unknown>> {
    return this.http
      .get<ApiResponse<PaginatedData<unknown>>>(`${environment.api}/api/rangos/getRangosUsuarios`)
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

  sessionOnlineUser(): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(`${environment.api}/api/usuarios/sessionOnlineUser`)
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

  getAdminsList(): Observable<UsuarioViewModel[]> {
    return this.http
      .get<ApiResponse<UsuarioViewModel[]>>(`${environment.api}/api/usuarios/getAdmins`)
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

  changeUsuariosRangosByPuntos(): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(`${environment.api}/api/rangos/changeUsuariosRangosByPuntos`)
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

  getUserStatus(userName: string): Observable<unknown> {
    return this.http
      .get<ApiResponse<unknown>>(
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

  removeAvatar(usuarioId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/usuarios/removeAvatar`, {
        id: usuarioId,
      })
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

  removeUsuario(usuarioId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/usuarios/removeUsuario`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: usuarioId },
      })
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

import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { PaginationService } from '../shared/pagination.service';
import { UserModel } from 'src/app/models/security/user.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class HttpSecurityService implements IHttpSecurityService {
  public currentUser: Observable<JwtUserModel>;
  private currentUserSubject: BehaviorSubject<JwtUserModel>;

  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private router: Router,
    private paginationService: PaginationService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.currentUserSubject = new BehaviorSubject<JwtUserModel>(JSON.parse('{}'));

    if (isPlatformBrowser(this.platformId)) {
      this.currentUserSubject = new BehaviorSubject<JwtUserModel>(
        JSON.parse(localStorage.getItem('pixicity') || '{}')
      );
    }

    this.currentUser = this.currentUserSubject.asObservable();
  }

  registerUser(user: UserModel): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/usuarios/registrarUsuario`, user)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  loginUser(user: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/usuarios/login`, user)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getCurrentUser(): JwtUserModel {
    return this.currentUserSubject.value;
  }

  getCurrentUserAsObservable(): Observable<JwtUserModel> {
    return this.currentUserSubject.asObservable();
  }

  getUsuarios(search: any): Observable<any> {
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
      .get<any>(
        `${environment.api}/api/usuarios/getUsuarios?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${searchParams}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getUsuariosAdmin(): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getUsuariosAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getLoggedUserByJwt(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/usuarios/getLoggedUserByJwt`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getUserByUserName(userName: string): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getUserByUserName?userName=${userName}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getSesiones(): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getSesiones?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteSessionById(sessionId: number): Observable<any> {
    return this.http
      .delete<any>(
        `${environment.api}/api/usuarios/deleteSesion?id=${sessionId}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  setUserToLocalStorage(obj: any): any {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pixicity', JSON.stringify(obj));
      this.currentUserSubject.next(obj);
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('pixicity');
    }

    this.router.navigateByUrl('');
    this.currentUserSubject.next(new JwtUserModel({}, ''));
  }

  changePassword(obj: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/usuarios/changeUserPassword`, obj)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  updateUsuario(usuario: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/usuarios/updateUsuario`, usuario)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getUsuarioInfo(userName: string): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getUsuarioInfo?userName=${userName}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  seguirUsuario(usuario: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/usuarios/seguirUsuario`, usuario)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  isFollowingTheUser(userName: any): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/isFollowingTheUser?userName=${userName}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getFollowingUsersByUserId(id: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getFollowingUsersByUserId?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${id}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getFollowersByUserId(userId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getFollowersByUserId?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${userId}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getLastFollowersByUserId(userId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getLastFollowersByUserId?userId=${userId}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  savePerfilInfo(perfil: any): Observable<any> {
    return this.http
      .put<any>(`${environment.api}/api/usuarios/savePerfilInfo`, perfil)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getCurrentPerfilInfo(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/usuarios/getCurrentPerfilInfo`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPerfilInfoByUserId(userId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getPerfilInfoByUserId?usuarioId=${userId}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getSocialMediaByUsuarioId(usuarioId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getSocialMediaByUsuarioId?usuarioId=${usuarioId}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  banUser(usuario: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/usuarios/banUser`, usuario)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  changeAvatar(file: Blob): Observable<any> {
    let formData: FormData = new FormData();
    formData.append('avatar.jpeg', file);

    return this.http
      .post<any>(`${environment.api}/api/usuarios/changeAvatar`, formData)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  changeAvatarAdmin(file: Blob, usuarioId: number): Observable<any> {
    let formData: FormData = new FormData();
    formData.append('avatar.jpeg', file);
    formData.append('usuarioId', usuarioId.toString());

    return this.http
      .post<any>(`${environment.api}/api/usuarios/changeAvatarAdmin`, formData)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getLastRegisteredUsers(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/usuarios/getLastRegisteredUsers`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getRangosUsuarios(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/rangos/getRangosUsuarios`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getRangosDropdown(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/rangos/getRangosDropdown`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getActividadUsuario(usuarioId: number, tipoActividad: any): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getActividadUsuario?usuarioId=${usuarioId}&tipoActividad=${tipoActividad}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  addUpdateRango(rango: any): Observable<number> {
    return this.http
      .post<any>(`${environment.api}/api/rangos/addUpdateRango`, rango)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  changeRango(rangoUsuario: any): Observable<boolean> {
    return this.http
      .post<any>(
        `${environment.api}/api/rangos/changeRangoUsuario`,
        rangoUsuario
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  sessionOnlineUser(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/usuarios/sessionOnlineUser`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  changeBackgroundProfile(obj: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/usuarios/changeBackgroundProfile`, obj)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getAdminsList(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/usuarios/getAdmins`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  changeUsuariosRangosByPuntos(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/rangos/changeUsuariosRangosByPuntos`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getUserStatus(userName: string): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/usuarios/getUserStatus?userName=${userName}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  removeAvatar(usuarioId: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/usuarios/removeAvatar`, {
        id: usuarioId,
      })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  removeUsuario(usuarioId: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.api}/api/usuarios/removeUsuario`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: usuarioId },
      })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}

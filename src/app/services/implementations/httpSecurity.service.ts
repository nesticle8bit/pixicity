import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { UsuarioAdminSearchFilter, UsuarioSearchFilter } from 'src/app/models/shared/service-types.model';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { JwtUserModel, LoginResponse } from 'src/app/models/security/jwtUser.model';
import { PaginationService } from '../shared/pagination.service';
import { UserModel } from 'src/app/models/security/user.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { AdminResumen, CuentaAdminModel, PerfilUsuarioViewModel, UsuarioAdminViewModel, UsuarioListadoViewModel, UsuarioViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { enNavegador } from '../../shared/helpers/plataforma';
@Injectable()
export class HttpSecurityService implements IHttpSecurityService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  private router = inject(Router);
  private paginationService = inject(PaginationService);
  private notificationService = inject(NotificationService);

  public currentUser: Observable<JwtUserModel>;
  private currentUserSubject: BehaviorSubject<JwtUserModel>;

  constructor() {
    // readStoredUser tolera el servidor (SSR / ng serve), donde no hay localStorage.
    this.currentUserSubject = new BehaviorSubject<JwtUserModel>(this.readStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();

    // Otra pestaña que renueva el token rota el refresh token: sin sincronizar, esta pestaña
    // intentaría renovar con uno ya invalidado y cerraría la sesión.
    if (enNavegador()) window.addEventListener('storage', (event) => {
      if (event.key === 'taringas') {
        this.currentUserSubject.next(this.readStoredUser());
      }
    });
  }

  private readStoredUser(): JwtUserModel {
    try {
      return JSON.parse(localStorage.getItem('taringas') || '{}');
    } catch {
      return new JwtUserModel(undefined, '');
    }
  }

  getCaptchaSiteKey(): Observable<string | null> {
    return this.http.get<ApiResponse<string | null>>(`${environment.api}/api/auth/captcha`).pipe(
      map((r) => (r.status === 200 ? r.data ?? null : null)),
      catchError(() => of(null)),
    );
  }

  registerUser(user: UserModel, captcha?: string): Observable<number> {
    const headers = captcha ? new HttpHeaders({ 'X-Captcha': captcha }) : undefined;
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/auth/registro`, user, { headers })
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

  loginUser(user: { userName: string; password: string }, captcha?: string): Observable<LoginResponse> {
    const headers = captcha ? new HttpHeaders({ 'X-Captcha': captcha }) : undefined;
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.api}/api/auth/login`, user, { headers })
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

  /** POST que devuelve data o lanza un Error con el mensaje del API (para mostrarlo en el formulario). */
  private postConError<T>(ruta: string, cuerpo: unknown, porDefecto: string): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${environment.api}/api/auth/${ruta}`, cuerpo).pipe(
      map((r) => {
        if (r.status === 200) return r.data!;
        throw new Error(r.errors?.join(', ') || porDefecto);
      }),
    );
  }

  login2FA(desafio: string, codigo: string): Observable<JwtUserModel> {
    return this.postConError<JwtUserModel>('login/2fa', { desafio, codigo }, 'El código no es correcto');
  }

  getEstado2FA(): Observable<{ activo: boolean }> {
    return this.http
      .get<ApiResponse<{ activo: boolean }>>(`${environment.api}/api/auth/2fa`)
      .pipe(map((r) => r.data ?? { activo: false }));
  }

  configurar2FA(): Observable<{ secreto: string; uri: string }> {
    return this.postConError('2fa/configuracion', {}, 'No se pudo generar la clave');
  }

  activar2FA(codigo: string): Observable<{ codigosRecuperacion: string[] }> {
    return this.postConError('2fa', { codigo }, 'El código no es correcto');
  }

  desactivar2FA(password: string, codigo: string): Observable<boolean> {
    return this.postConError('2fa/desactivacion', { password, codigo }, 'No se pudo desactivar');
  }

  private refreshEnCurso: Observable<string> | null = null;

  // Intercambia el refresh token por un nuevo access token (rotación) y actualiza el storage.
  // Una sola renovación a la vez: el refresh token se rota y un segundo intento con el mismo fallaría.
  refreshAccessToken(): Observable<string> {
    const currentUser = this.currentUserSubject.value;
    const refreshToken = currentUser?.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token'));
    }

    if (this.refreshEnCurso) {
      return this.refreshEnCurso;
    }

    this.refreshEnCurso = this.http
      .post<ApiResponse<{ token: string; refreshToken: string }>>(
        `${environment.api}/api/auth/refresh`,
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
        }),
        catchError((err) => {
          // Dos pestañas pueden renovar a la vez con el mismo refresh token: la que pierde
          // toma el token que ya guardó la otra en vez de cerrar la sesión.
          const stored = this.readStoredUser();
          if (stored?.token && stored.refreshToken && stored.refreshToken !== refreshToken) {
            this.currentUserSubject.next(stored);
            return of(stored.token);
          }
          return throwError(() => err);
        }),
        finalize(() => {
          this.refreshEnCurso = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    return this.refreshEnCurso;
  }

  getCurrentUser(): JwtUserModel {
    return this.currentUserSubject.value;
  }

  getCurrentUserAsObservable(): Observable<JwtUserModel> {
    return this.currentUserSubject.asObservable();
  }

  getUsuarios(search: UsuarioSearchFilter): Observable<PaginatedData<UsuarioListadoViewModel, 'usuarios'>> {
    let params = new HttpParams()
      .set('page', search?.page ?? 1)
      .set('pageCount', search?.pageCount ?? 24);

    if (search?.genero) params = params.set('genero', search.genero);
    if (search?.pais) params = params.set('pais', search.pais);
    if (search?.rango) params = params.set('rango', search.rango);
    if (search?.enLinea) params = params.set('enLinea', true);
    if (search?.query?.trim()) params = params.set('query', search.query.trim());
    if (search?.orden && search.orden !== 'recientes') params = params.set('orderBy', search.orden);

    return this.http
      .get<ApiResponse<PaginatedData<UsuarioListadoViewModel, 'usuarios'>>>(`${environment.api}/api/usuarios`, { params })
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

  getUsuariosAdmin(search: UsuarioAdminSearchFilter, filtro: AdminFiltro = {}): Observable<PaginatedData<UsuarioAdminViewModel, 'usuarios'>> {
    let searchParams = ``;

    if (search?.rangoId) {
      searchParams += `&rango=${search.rangoId}`;
    }

    return this.http
      .get<ApiResponse<PaginatedData<UsuarioAdminViewModel, 'usuarios'>>>(
        `${environment.api}/api/usuarios/admin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${searchParams}`, { params: adminParams(filtro) }
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

  getLoggedUserByJwt(): Observable<UsuarioViewModel> {
    return this.http
      .get<ApiResponse<UsuarioViewModel>>(`${environment.api}/api/usuarios/me`)
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
        `${environment.api}/api/usuarios/por-nombre/${encodeURIComponent(userName)}`
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

  getSesiones(filtro: AdminFiltro = {}): Observable<PaginatedData<unknown>> {
    return this.http
      .get<ApiResponse<PaginatedData<unknown>>>(
        `${environment.api}/api/usuarios/sesiones?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) }
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
        `${environment.api}/api/usuarios/sesiones/${sessionId}`
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

  confirmarEmail(token: string): Observable<{ userName: string }> {
    return this.http
      .post<ApiResponse<{ userName: string }>>(`${environment.api}/api/auth/email/confirmacion`, { token })
      .pipe(
        map((r) => {
          if (r.status === 200) return r.data!;
          throw new Error(r.errors?.join(', ') || 'No se pudo confirmar el correo');
        }),
      );
  }

  reenviarConfirmacion(): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${environment.api}/api/auth/email/reenvio`, {}).pipe(
      map((r) => {
        if (r.status === 200) return true;
        this.notificationService.warning(r.errors.join(', '), 'Correo');
        return false;
      }),
    );
  }

  solicitarRestablecimiento(email: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${environment.api}/api/auth/password/restablecimiento`, { email }).pipe(
      map((r) => {
        if (r.status === 200) return true;
        throw new Error(r.errors?.join(', ') || 'No se pudo enviar el correo');
      }),
    );
  }

  restablecerPassword(token: string, password: string): Observable<{ userName: string }> {
    return this.http
      .put<ApiResponse<{ userName: string }>>(`${environment.api}/api/auth/password`, { token, password })
      .pipe(
        map((r) => {
          if (r.status === 200) return r.data!;
          throw new Error(r.errors?.join(', ') || 'No se pudo cambiar la contraseña');
        }),
      );
  }

  reenviarConfirmacionAdmin(usuarioId: number): Observable<boolean> {
    return this.accionAdminEmail('post', `${usuarioId}/email/reenvio`);
  }

  confirmarEmailAdmin(usuarioId: number): Observable<boolean> {
    return this.accionAdminEmail('put', `${usuarioId}/email/confirmacion`);
  }

  private accionAdminEmail(verbo: 'post' | 'put', ruta: string): Observable<boolean> {
    const url = `${environment.api}/api/usuarios/${ruta}`;
    const peticion = verbo === 'put' ? this.http.put<ApiResponse<boolean>>(url, {}) : this.http.post<ApiResponse<boolean>>(url, {});
    return peticion.pipe(
      map((r) => {
        if (r.status === 200) return true;
        this.notificationService.error(r.errors.join(', '), 'Error');
        return false;
      }),
    );
  }

  getEstadoEmail(): Observable<{ emailConfirmado: boolean; email: string }> {
    return this.http
      .get<ApiResponse<{ emailConfirmado: boolean; email: string }>>(`${environment.api}/api/auth/email`)
      .pipe(
        map((r) => {
          if (r.status === 200) return r.data!;
          throw new Error(r.errors?.join(', ') ?? 'Error');
        }),
      );
  }

  marcarEmailConfirmado(confirmado: boolean): void {
    const actual = this.currentUserSubject.value;
    if (!actual?.usuario || actual.usuario.emailConfirmado === confirmado) return;
    this.setUserToLocalStorage({ ...actual, usuario: { ...actual.usuario, emailConfirmado: confirmado } });
  }

  setUserToLocalStorage(obj: JwtUserModel): void {
    localStorage.setItem('taringas', JSON.stringify(obj));
    this.currentUserSubject.next(obj);
  }

  logout(): void {
    localStorage.removeItem('taringas');

    this.router.navigateByUrl('');
    this.currentUserSubject.next(new JwtUserModel(undefined, ''));
  }

  changePassword(obj: { currentPassword: string; newPassword: string }): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/usuarios/me/password`, obj)
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
      .put<ApiResponse<boolean>>(`${environment.api}/api/usuarios/me`, usuario)
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
      .post<ApiResponse<boolean>>(`${environment.api}/api/usuarios/baneos`, usuario)
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
      .put<ApiResponse<string>>(`${environment.api}/api/usuarios/admin/avatar`, formData)
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

  getLastRegisteredUsers(version?: number): Observable<UsuarioViewModel[]> {
    return this.http
      .get<ApiResponse<UsuarioViewModel[]>>(`${environment.api}/api/usuarios/recientes${version ? `?v=${version}` : ''}`)
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
      .put<ApiResponse<boolean>>(`${environment.api}/api/usuarios/me/presencia`, {})
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

  getAdminsList(): Observable<AdminResumen[]> {
    return this.http
      .get<ApiResponse<AdminResumen[]>>(`${environment.api}/api/usuarios/admins`)
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
      .delete<ApiResponse<boolean>>(`${environment.api}/api/usuarios/${usuarioId}/avatar`)
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
      .delete<ApiResponse<boolean>>(`${environment.api}/api/usuarios/${usuarioId}`)
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

  getCuentaAdmin(usuarioId: number): Observable<CuentaAdminModel> {
    return this.http
      .get<ApiResponse<CuentaAdminModel>>(`${environment.api}/api/usuarios/${usuarioId}/cuenta`)
      .pipe(
        map((response) => {
          if (response.status === 200) return response.data!;
          this.notificationService.error(response.errors.join(', '), 'Error');
          throw new Error(response.errors?.join(', ') ?? 'Error');
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  editarCuentaAdmin(cuenta: CuentaAdminModel): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/usuarios/${cuenta.id}/cuenta`, cuenta)
      .pipe(
        map((response) => {
          if (response.status === 200) return response.data!;
          this.notificationService.error(response.errors.join(', '), 'Error');
          throw new Error(response.errors?.join(', ') ?? 'Error');
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}

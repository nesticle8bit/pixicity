import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { UsuarioAdminSearchFilter, UsuarioSearchFilter } from 'src/app/models/shared/service-types.model';
import { JwtUserModel, LoginResponse } from 'src/app/models/security/jwtUser.model';
import { UserModel } from 'src/app/models/security/user.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { PerfilUsuarioViewModel, UsuarioAdminViewModel, UsuarioViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
@Injectable()
export abstract class IHttpSecurityService {
  abstract getCurrentUser(): JwtUserModel;
  abstract getCurrentUserAsObservable(): Observable<JwtUserModel>;
  abstract getUsuarios(search: UsuarioSearchFilter): Observable<PaginatedData<UsuarioViewModel, 'usuarios'>>;
  abstract getUsuariosAdmin(search: UsuarioAdminSearchFilter, filtro?: AdminFiltro): Observable<PaginatedData<UsuarioAdminViewModel, 'usuarios'>>;
  abstract getLoggedUserByJwt(): Observable<UsuarioViewModel>;
  abstract getUserByUserName(userName: string): Observable<PerfilUsuarioViewModel>;
  abstract getSesiones(filtro?: AdminFiltro): Observable<PaginatedData<unknown>>;
  abstract deleteSessionById(sessionId: number): Observable<boolean>;
  abstract setUserToLocalStorage(obj: any): any;
  abstract registerUser(user: UserModel): Observable<number>;
  abstract loginUser(user: { userName: string; password: string }): Observable<LoginResponse>;
  abstract refreshAccessToken(): Observable<string>;
  abstract logout(): any;
  abstract changePassword(obj: { currentPassword: string; newPassword: string }): Observable<boolean>;
  abstract updateUsuario(usuario: UsuarioViewModel): Observable<boolean>;
  abstract banUser(usuario: { userName: string; razon?: string }): Observable<boolean>;
  abstract changeAvatarAdmin(file: Blob, usuarioId: number): Observable<string>;
  abstract getLastRegisteredUsers(): Observable<UsuarioViewModel[]>;
  abstract sessionOnlineUser(): Observable<boolean>;
  abstract getAdminsList(): Observable<UsuarioViewModel[]>;
  abstract removeAvatar(usuarioId: number): Observable<boolean>;
  abstract removeUsuario(usuarioId: number): Observable<boolean>;
}

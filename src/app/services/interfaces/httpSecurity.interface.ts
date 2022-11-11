import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { UserModel } from 'src/app/models/security/user.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpSecurityService {
  abstract getCurrentUser(): JwtUserModel;
  abstract getCurrentUserAsObservable(): Observable<JwtUserModel>;
  abstract getUsuarios(search: any): Observable<any>;
  abstract getUsuariosAdmin(): Observable<any>;
  abstract getLoggedUserByJwt(): Observable<any>;
  abstract getUserByUserName(userName: string): Observable<any>;
  abstract getSesiones(): Observable<any>;
  abstract deleteSessionById(sessionId: number): Observable<any>;
  abstract setUserToLocalStorage(obj: any): any;
  abstract registerUser(user: UserModel): Observable<any>;
  abstract loginUser(user: any): Observable<any>;
  abstract logout(): any;
  abstract changePassword(obj: any): Observable<any>;
  abstract updateUsuario(usuario: any): Observable<any>;
  abstract getUsuarioInfo(userName: string): Observable<any>;
  abstract seguirUsuario(usuario: any): Observable<any>;
  abstract isFollowingTheUser(userName: any): Observable<any>;
  abstract getFollowingUsersByUserId(id: number): Observable<any>;
  abstract getFollowersByUserId(userId: number): Observable<any>;
  abstract getLastFollowersByUserId(userId: number): Observable<any>;
  abstract savePerfilInfo(perfil: any): Observable<any>;
  abstract getCurrentPerfilInfo(): Observable<any>;
  abstract getPerfilInfoByUserId(userId: number): Observable<any>;
  abstract getSocialMediaByUsuarioId(usuarioId: number): Observable<any>;
  abstract banUser(usuario: any): Observable<any>;
  abstract changeAvatar(file: Blob): Observable<any>;
  abstract changeAvatarAdmin(file: Blob, usuarioId: number): Observable<any>;
  abstract getLastRegisteredUsers(): Observable<any>;
  abstract getRangosUsuarios(): Observable<any>;
  abstract getRangosDropdown(): Observable<any>;
  abstract getActividadUsuario(
    usuarioId: number,
    tipoActividad: any
  ): Observable<any>;
  abstract addUpdateRango(rango: any): Observable<number>;
  abstract changeRango(rangoUsuario: any): Observable<boolean>;
  abstract sessionOnlineUser(): Observable<any>;
  abstract changeBackgroundProfile(obj: any): Observable<any>;
  abstract getAdminsList(): Observable<any>;
}

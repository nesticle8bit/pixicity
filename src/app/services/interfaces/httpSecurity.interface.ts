import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { UserModel } from 'src/app/models/security/user.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpSecurityService {
  abstract getCurrentUser(): JwtUserModel;
  abstract getCurrentUserAsObservable(): Observable<JwtUserModel>;
  abstract getUsuarios(): Observable<any>;
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
  abstract savePerfilInfo(perfil: any): Observable<any>;
  abstract getCurrentPerfilInfo(): Observable<any>;
  abstract getSocialMediaByUsuarioId(usuarioId: number): Observable<any>;
}

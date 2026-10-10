import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { ActividadViewModel } from 'src/app/models/logs/logs-vm.model';
import { PerfilInfoResponse, PerfilUsuarioViewModel, SeguidoresResponse, UsuarioAvatarViewModel, UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';

/** Perfil de usuarios: info pública, perfil extendido, seguidores, avatar, fondo, actividad y estado en línea. */
@Injectable()
export abstract class IHttpUsuarioPerfilService {
  abstract getUsuarioInfo(userName: string): Observable<UsuarioInfoViewModel>;
  abstract seguirUsuario(usuario: { userName: string }): Observable<boolean>;
  abstract isFollowingTheUser(userName: string): Observable<boolean>;
  abstract getFollowingUsersByUserId(id: number): Observable<PaginatedData<UsuarioAvatarViewModel>>;
  abstract getFollowersByUserId(userId: number): Observable<PaginatedData<UsuarioAvatarViewModel>>;
  abstract getLastFollowersByUserId(userId: number): Observable<SeguidoresResponse>;
  abstract savePerfilInfo(perfil: Partial<PerfilUsuarioViewModel>): Observable<boolean>;
  abstract getCurrentPerfilInfo(): Observable<PerfilInfoResponse>;
  abstract getPerfilInfoByUserId(userId: number): Observable<PerfilUsuarioViewModel>;
  abstract getSocialMediaByUsuarioId(usuarioId: number): Observable<unknown>;
  abstract changeAvatar(file: Blob): Observable<string>;
  abstract getActividadUsuario(usuarioId: number, tipoActividad: number): Observable<ActividadViewModel[]>;
  abstract changeBackgroundProfile(obj: { imageUrl: string }): Observable<boolean>;
  abstract getUserStatus(userName: string): Observable<number | null>;
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { ActividadLogsViewModel } from 'src/app/models/logs/logs-vm.model';
import { FiltroMuroPerfil, MuroPerfil, SeccionMuroPerfil } from 'src/app/models/perfil/perfil-muro.model';
import { PerfilInfoResponse, PerfilUsuarioViewModel, SeguidoresResponse, UsuarioAvatarViewModel, UsuarioInfoViewModel, FondoPerfilRequest } from 'src/app/models/seguridad/seguridad-vm.model';

/** Perfil de usuarios: info pública, perfil extendido, seguidores, avatar, fondo, actividad y estado en línea. */
@Injectable()
export abstract class IHttpUsuarioPerfilService {
  abstract getUsuarioInfo(userName: string): Observable<UsuarioInfoViewModel>;
  /** Autocompletar @menciones. Nunca falla: ante un error devuelve []. */
  abstract sugerirMenciones(prefijo: string): Observable<UsuarioAvatarViewModel[]>;
  abstract seguirUsuario(usuario: { userName: string }): Observable<boolean>;
  abstract isFollowingTheUser(userName: string): Observable<boolean>;
  /** Si `userName` sigue al usuario con sesión (insignia "Te sigue" del perfil). */
  abstract teSigue(userName: string): Observable<boolean>;
  abstract getFollowingUsersByUserId(id: number): Observable<PaginatedData<UsuarioAvatarViewModel>>;
  abstract getFollowersByUserId(userId: number): Observable<PaginatedData<UsuarioAvatarViewModel>>;
  abstract getLastFollowersByUserId(userId: number): Observable<SeguidoresResponse>;
  abstract savePerfilInfo(perfil: Partial<PerfilUsuarioViewModel>): Observable<boolean>;
  abstract getCurrentPerfilInfo(): Observable<PerfilInfoResponse>;
  abstract getPerfilInfoByUserId(userId: number): Observable<PerfilUsuarioViewModel>;
  abstract getSocialMediaByUsuarioId(usuarioId: number): Observable<unknown>;
  abstract changeAvatar(file: Blob): Observable<string>;
  abstract getActividadUsuario(usuarioId: number, tipoActividad: number): Observable<ActividadLogsViewModel>;
  /** Línea de tiempo del perfil, hacia atrás desde `antes` (el `siguiente` de la página anterior). */
  abstract getMuroPerfil(usuarioId: number, antes: string | null, filtro: FiltroMuroPerfil, cantidad?: number): Observable<MuroPerfil>;
  /** Partes de mi muro que oculté. */
  abstract getMuroPrivacidad(): Observable<SeccionMuroPerfil[]>;
  /** Reemplaza lo oculto de mi muro; devuelve lo que quedó guardado. */
  abstract setMuroPrivacidad(ocultas: SeccionMuroPerfil[]): Observable<SeccionMuroPerfil[]>;
  /** Archivo JSON con todos los datos propios del usuario actual. */
  abstract exportarMisDatos(): Observable<Blob>;
  abstract changeBackgroundProfile(obj: FondoPerfilRequest): Observable<boolean>;
  abstract getUserStatus(userName: string): Observable<number | null>;
}

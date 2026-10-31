import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { UsuarioAdminSearchFilter, UsuarioSearchFilter } from 'src/app/models/shared/service-types.model';
import { JwtUserModel, LoginResponse } from 'src/app/models/security/jwtUser.model';
import { UserModel } from 'src/app/models/security/user.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { AdminResumen, CuentaAdminModel, PerfilUsuarioViewModel, SesionActivaViewModel, UsuarioAdminViewModel, UsuarioListadoViewModel, UsuarioViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
@Injectable()
export abstract class IHttpSecurityService {
  abstract getCurrentUser(): JwtUserModel;
  abstract getCurrentUserAsObservable(): Observable<JwtUserModel>;
  abstract getUsuarios(search: UsuarioSearchFilter): Observable<PaginatedData<UsuarioListadoViewModel, 'usuarios'>>;
  abstract getUsuariosAdmin(search: UsuarioAdminSearchFilter, filtro?: AdminFiltro): Observable<PaginatedData<UsuarioAdminViewModel, 'usuarios'>>;
  abstract getLoggedUserByJwt(): Observable<UsuarioViewModel>;
  abstract getUserByUserName(userName: string): Observable<PerfilUsuarioViewModel>;
  abstract getSesiones(filtro?: AdminFiltro): Observable<PaginatedData<unknown>>;
  abstract deleteSessionById(sessionId: number): Observable<boolean>;
  /** Dispositivos con la cuenta abierta (/cuenta → Sesiones activas). */
  abstract getMisSesiones(): Observable<SesionActivaViewModel[]>;
  abstract cerrarMiSesion(sessionId: number): Observable<boolean>;
  /** Cierra todas menos la de este dispositivo; devuelve cuántas cerró. */
  abstract cerrarOtrasSesiones(): Observable<number>;
  abstract setUserToLocalStorage(obj: any): any;
  abstract registerUser(user: UserModel, captcha?: string): Observable<number>;
  /** Clave pública del captcha del registro; null si el API no lo pide. Nunca falla. */
  abstract getCaptchaSiteKey(): Observable<string | null>;
  abstract loginUser(user: { userName: string; password: string }, captcha?: string): Observable<LoginResponse>;
  abstract refreshAccessToken(): Observable<string>;
  /** Segundo paso del login: código de la app o de recuperación. Error con el motivo si no sirve. */
  abstract login2FA(desafio: string, codigo: string): Observable<JwtUserModel>;
  abstract getEstado2FA(): Observable<{ activo: boolean }>;
  abstract configurar2FA(): Observable<{ secreto: string; uri: string }>;
  abstract activar2FA(codigo: string): Observable<{ codigosRecuperacion: string[] }>;
  abstract desactivar2FA(password: string, codigo: string): Observable<boolean>;
  abstract logout(): any;
  abstract changePassword(obj: { currentPassword: string; newPassword: string }): Observable<boolean>;
  abstract updateUsuario(usuario: UsuarioViewModel): Observable<boolean>;
  abstract banUser(usuario: { userName: string; razon?: string }): Observable<boolean>;
  abstract changeAvatarAdmin(file: Blob, usuarioId: number): Observable<string>;
  abstract getLastRegisteredUsers(version?: number): Observable<UsuarioViewModel[]>;
  abstract sessionOnlineUser(): Observable<boolean>;
  abstract getAdminsList(): Observable<AdminResumen[]>;
  abstract removeAvatar(usuarioId: number): Observable<boolean>;
  abstract removeUsuario(usuarioId: number): Observable<boolean>;
  abstract getCuentaAdmin(usuarioId: number): Observable<CuentaAdminModel>;
  /** true si guardó cambios; false si no había nada distinto. */
  abstract editarCuentaAdmin(cuenta: CuentaAdminModel): Observable<boolean>;
  /** Confirma el correo con el token del enlace. Devuelve el usuario confirmado; error con el motivo si no es válido. */
  abstract confirmarEmail(token: string): Observable<{ userName: string }>;
  abstract reenviarConfirmacion(): Observable<boolean>;
  /** "Olvidé mi contraseña": siempre responde igual, exista o no la cuenta. */
  abstract solicitarRestablecimiento(email: string): Observable<boolean>;
  /** Error con el motivo si el enlace no sirve o la contraseña no cumple. */
  abstract restablecerPassword(token: string, password: string): Observable<{ userName: string }>;
  /** Admin: reenvía la confirmación / marca el correo como confirmado. Muestran el error del API y devuelven false. */
  abstract reenviarConfirmacionAdmin(usuarioId: number): Observable<boolean>;
  abstract confirmarEmailAdmin(usuarioId: number): Observable<boolean>;
  abstract getEstadoEmail():Observable<{ emailConfirmado: boolean; email: string }>;
  /** Actualiza el estado del correo en la sesión guardada (muestra u oculta el aviso de confirmar). */
  abstract marcarEmailConfirmado(confirmado: boolean): void;
}

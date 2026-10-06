/** Usuario de la sesión tal como lo devuelve /usuarios/login. */
export interface UsuarioSesion {
  /** Id en base64 (así lo envía el login); usar idUsuarioSesion() para compararlo con ids numéricos. */
  id?: string;
  userName?: string;
  rango?: string;
  avatar?: string | null;
}

export class JwtUserModel {
    /** undefined sin sesión: las plantillas deciden "hay sesión" con `@if (currentUser.usuario)`. */
    usuario?: UsuarioSesion;
    token: string;
    refreshToken?: string;

    constructor(usuario: UsuarioSesion | undefined, token: string, refreshToken?: string) {
        this.usuario = usuario;
        this.token = token;
        this.refreshToken = refreshToken;
    }
}

/** Id numérico del usuario de la sesión (el login lo envía en base64), o null si no hay sesión. */
export function idUsuarioSesion(usuario: UsuarioSesion | null | undefined): number | null {
  if (!usuario?.id) {
    return null;
  }
  try {
    const id = Number(atob(usuario.id));
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

/** Cuenta suspendida: el login responde 200 pero con este objeto en vez de la sesión. */
export interface LoginBaneado {
  error: 'baneado' | 'baneado_permanente';
  razonBaneo: string;
  tiempoBaneado?: string;
  baneadoPermanente?: boolean;
}

/** Resultado de /usuarios/login: la sesión, el texto 'error' (credenciales incorrectas) o una suspensión. */
export type LoginResponse = JwtUserModel | 'error' | LoginBaneado;

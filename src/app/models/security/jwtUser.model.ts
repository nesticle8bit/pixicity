export class JwtUserModel {
    usuario: any;
    token: string;
    refreshToken?: string;

    constructor(usuario: any, token: string, refreshToken?: string) {
        this.usuario = usuario;
        this.token = token;
        this.refreshToken = refreshToken;
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

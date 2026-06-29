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

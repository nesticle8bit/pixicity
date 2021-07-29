export class JwtUserModel {
    usuario: any;
    token: string;

    constructor(usuario: any, token: string) {
        this.usuario = usuario;
        this.token = token;
    }
}
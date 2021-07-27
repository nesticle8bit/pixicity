export class UserModel {
    userName: string;
    password: string;
    email: string;
    fechaNacimiento: string;
    dia: number;
    mes: number;
    año: number;
    genero: number;
    paisId: number;
    estadoId: number;
    termsConditions: boolean;

    constructor(userName: string, password: string, email: string, fechaNacimiento: string, dia: number, mes: number, año: number, genero: number, paisId: number, estadoId: number, termsConditions: boolean) {
        this.userName = userName;
        this.password = password;
        this.email = email;
        this.fechaNacimiento = fechaNacimiento;
        this.dia = dia;
        this.mes = mes;
        this.año = año;
        this.genero = genero;
        this.paisId = paisId;
        this.estadoId = estadoId;
        this.termsConditions = termsConditions;
    }
}
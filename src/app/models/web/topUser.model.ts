export class TopUserModel {
  id: number;
  userName: string;
  puntos: number;

  constructor(id: number, userName: string, puntos: number) {
    this.id = id;
    this.userName = userName;
    this.puntos = puntos;
  }
}

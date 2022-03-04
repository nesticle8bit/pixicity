export class TopUserModel {
  id: number;
  userName: string;
  puntos: number;
  avatar: string;

  constructor(id: number, userName: string, puntos: number, avatar: string) {
    this.id = id;
    this.userName = userName;
    this.puntos = puntos;
    this.avatar = avatar;
  }
}

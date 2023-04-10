export class NoticiaModel {
  orden: number;
  contenido: string;

  constructor(orden: number, contenido: string) {
    this.orden = orden;
    this.contenido = contenido;
  }
}

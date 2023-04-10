export class BaseModel {
  id: number;
  eliminado: boolean;
  usuarioRegistra: string;
  fechaRegistro: Date;
  usuarioActualiza: string;
  fechaActualiza: Date;
  usuarioElimina: string;
  fechaElimina: Date;

  constructor(
    id: number,
    eliminado: boolean,
    usuarioRegistra: string,
    fechaRegistro: Date,
    usuarioActualiza: string,
    fechaActualiza: Date,
    usuarioElimina: string,
    fechaElimina: Date
  ) {
    this.id = id;
    this.eliminado = eliminado;
    this.usuarioRegistra = usuarioRegistra;
    this.fechaRegistro = fechaRegistro;
    this.usuarioActualiza = usuarioActualiza;
    this.fechaActualiza = fechaActualiza;
    this.usuarioElimina = usuarioElimina;
    this.fechaElimina = fechaElimina;
  }
}

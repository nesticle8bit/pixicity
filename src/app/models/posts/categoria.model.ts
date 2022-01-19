export class CategoriaModel {
  id: number;
  nombre: string;
  seo: string;
  icono: string;

  constructor(id: number, nombre: string, seo: string, icono: string) {
    this.id = id;
    this.nombre = nombre;
    this.seo = seo;
    this.icono = icono;
  }
}

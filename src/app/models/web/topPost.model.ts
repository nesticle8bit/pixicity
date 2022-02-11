import { CategoriaModel } from "../posts/categoria.model";

export class TopPostModel {
    id: number;
    url: string;
    titulo: string;
    categoria: CategoriaModel;
    puntos: number;
  
    constructor(id: number, url: string, titulo: string, categoria: CategoriaModel, puntos: number) {
      this.id = id;
      this.url = url;
      this.titulo = titulo;
      this.categoria = categoria;
      this.puntos = puntos;
    }
  }
  
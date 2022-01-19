import { CategoriaModel } from "../posts/categoria.model";

export class TopPostModel {
    id: number;
    url: string;
    titulo: string;
    categoria: CategoriaModel;
  
    constructor(id: number, url: string, titulo: string, categoria: CategoriaModel) {
      this.id = id;
      this.url = url;
      this.titulo = titulo;
      this.categoria = categoria;
    }
  }
  
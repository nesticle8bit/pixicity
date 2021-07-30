export class AfiliacionModel {
    titulo: string;
    url: string;
    banner: string;
    descripcion: string;

    constructor(titulo: any, url: string, banner: string, descripcion: string) {
        this.titulo = titulo;
        this.url = url;
        this.banner = banner;
        this.descripcion = descripcion;
    }
}
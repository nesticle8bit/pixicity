import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpComunidadesService {
  // Taxonomía
  abstract getCategorias(): Observable<any>;
  abstract getSubCategorias(categoriaId: number): Observable<any>;
  abstract saveCategoria(model: any): Observable<any>;
  abstract deleteCategoria(id: number): Observable<any>;
  abstract saveSubCategoria(model: any): Observable<any>;
  abstract deleteSubCategoria(id: number): Observable<any>;

  // Comunidades
  abstract getComunidades(search: any): Observable<any>;
  abstract getComunidad(nombreCorto: string): Observable<any>;
  abstract saveComunidad(model: any): Observable<any>;
  abstract updateComunidad(model: any): Observable<any>;
  abstract deleteComunidad(id: number): Observable<any>;

  // Membresía / seguir
  abstract unirme(comunidadId: number): Observable<any>;
  abstract abandonar(comunidadId: number): Observable<any>;
  abstract seguir(comunidadId: number): Observable<any>;
  abstract getMiembros(comunidadId: number, search: any): Observable<any>;
  abstract cambiarRangoMiembro(comunidadId: number, usuarioId: number, permiso: number, esStaff: boolean): Observable<any>;

  // Temas
  abstract getTemas(comunidadId: number, search: any): Observable<any>;
  abstract getTema(id: number): Observable<any>;
  abstract saveTema(model: any): Observable<any>;
  abstract deleteTema(id: number): Observable<any>;
  abstract changeStickyTema(id: number): Observable<any>;
  abstract addTemaComentario(model: any): Observable<any>;
  abstract editarComentario(comentarioId: number, contenido: string): Observable<any>;
  abstract eliminarComentario(comentarioId: number): Observable<any>;
  abstract votarComentario(comentarioId: number, valor: number): Observable<any>;
  abstract votarTema(temaId: number, valor: number): Observable<any>;
  abstract fijarComentario(comentarioId: number): Observable<any>;
  abstract denunciarComentario(comentarioId: number, motivo: string): Observable<any>;

  // Denuncias de comentarios (panel admin)
  abstract getDenunciasComentarios(page: number, pageCount: number, soloPendientes?: boolean): Observable<any>;
  abstract resolverDenunciaComentario(denunciaId: number): Observable<any>;
  abstract eliminarDenunciaComentario(denunciaId: number): Observable<any>;

  // Widgets
  abstract getTopTemas(comunidadId: number, periodo: string): Observable<any>;
  abstract getComentariosRecientes(comunidadId: number, count?: number): Observable<any>;

  // Widgets globales (portada)
  abstract getTemasRecientes(count?: number): Observable<any>;
  abstract getComentariosRecientesGlobal(count?: number): Observable<any>;
  abstract getTopComunidades(count?: number): Observable<any>;
  abstract getTopTemasGlobal(periodo: string, count?: number): Observable<any>;
  abstract getEstadisticas(): Observable<any>;
}

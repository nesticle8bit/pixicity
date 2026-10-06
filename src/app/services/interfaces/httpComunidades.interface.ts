import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import {
  BusquedaComunidades,
  BusquedaPaginada,
  ComentarioReciente,
  ComunidadCard,
  ComunidadCategoria,
  ComunidadCategoriaGuardar,
  ComunidadDetalle,
  ComunidadesEstadisticas,
  ComunidadGuardar,
  ComunidadMiembro,
  ComunidadSubCategoria,
  ComunidadSubCategoriaGuardar,
  ResultadoVoto,
  TemaComentarioGuardar,
  TemaDetalle,
  TemaGuardar,
  TemaListado,
  TemaReciente,
  TemaTop,
  TemaTopGlobal,
} from 'src/app/models/comunidades/comunidad.model';

@Injectable()
export abstract class IHttpComunidadesService {
  // Taxonomía
  abstract getCategorias(): Observable<ComunidadCategoria[]>;
  abstract getSubCategorias(categoriaId: number): Observable<ComunidadSubCategoria[]>;
  abstract saveCategoria(model: ComunidadCategoriaGuardar): Observable<number>;
  abstract deleteCategoria(id: number): Observable<boolean>;
  abstract saveSubCategoria(model: ComunidadSubCategoriaGuardar): Observable<number>;
  abstract deleteSubCategoria(id: number): Observable<boolean>;

  // Comunidades
  abstract getComunidades(search?: BusquedaComunidades): Observable<PaginatedData<ComunidadCard>>;
  abstract getComunidad(nombreCorto: string): Observable<ComunidadDetalle>;
  abstract saveComunidad(model: ComunidadGuardar): Observable<number>;
  abstract updateComunidad(model: ComunidadGuardar): Observable<number>;
  abstract deleteComunidad(id: number): Observable<boolean>;

  // Membresía / seguir
  abstract unirme(comunidadId: number): Observable<boolean>;
  abstract abandonar(comunidadId: number): Observable<boolean>;
  abstract seguir(comunidadId: number): Observable<boolean>;
  abstract getMiembros(comunidadId: number, search?: BusquedaPaginada): Observable<PaginatedData<ComunidadMiembro>>;
  abstract cambiarRangoMiembro(comunidadId: number, usuarioId: number, permiso: number, esStaff: boolean): Observable<boolean>;

  // Temas
  abstract getTemas(comunidadId: number, search?: BusquedaPaginada): Observable<PaginatedData<TemaListado>>;
  abstract getTema(id: number): Observable<TemaDetalle>;
  abstract saveTema(model: TemaGuardar): Observable<number>;
  abstract deleteTema(id: number): Observable<boolean>;
  abstract changeStickyTema(id: number): Observable<boolean>;
  abstract addTemaComentario(model: TemaComentarioGuardar): Observable<number>;
  abstract editarComentario(comentarioId: number, contenido: string): Observable<boolean>;
  abstract eliminarComentario(comentarioId: number): Observable<boolean>;
  abstract votarComentario(comentarioId: number, valor: number): Observable<ResultadoVoto>;
  abstract votarTema(temaId: number, valor: number): Observable<ResultadoVoto>;
  abstract fijarComentario(comentarioId: number): Observable<boolean>;
  abstract denunciarComentario(comentarioId: number, motivo: string): Observable<boolean>;

  // Widgets
  abstract getTopTemas(comunidadId: number, periodo?: string): Observable<TemaTop[]>;
  abstract getComentariosRecientes(comunidadId: number, count?: number): Observable<ComentarioReciente[]>;

  // Widgets globales (portada)
  abstract getTemasRecientes(count?: number): Observable<TemaReciente[]>;
  abstract getComentariosRecientesGlobal(count?: number): Observable<ComentarioReciente[]>;
  abstract getTopComunidades(count?: number): Observable<ComunidadCard[]>;
  abstract getTopTemasGlobal(periodo?: string, count?: number): Observable<TemaTopGlobal[]>;
  abstract getEstadisticas(): Observable<ComunidadesEstadisticas>;
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { IHttpComunidadesService } from '../interfaces/httpComunidades.interface';
import {
  BusquedaComunidades,
  BusquedaPaginada,
  ComentarioReciente,
  ComunidadCard,
  ComunidadCategoria,
  ComunidadCategoriaAdmin,
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
export class HttpComunidadesService implements IHttpComunidadesService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  private notificationService = inject(NotificationService);

  private readonly base = `${environment.api}/api/comunidades`;

  private unwrap<T>(obs: Observable<ApiResponse<T>>): Observable<T> {
    return obs.pipe(
      map((response) => {
        if (response.status === 200) {
          return response.data!;
        }
        this.notificationService.error(response.errors?.join(', ') ?? 'Error', 'Error');
        throw new Error(response.errors?.join(', ') ?? 'Error');
      }),
      catchError(this.helper.errorHandler)
    );
  }

  private url(ruta: string): string {
    return !ruta || ruta.startsWith('?') ? `${this.base}${ruta}` : `${this.base}/${ruta}`;
  }

  private get<T>(ruta: string): Observable<T> {
    return this.unwrap(this.http.get<ApiResponse<T>>(this.url(ruta)));
  }

  private post<T>(ruta: string, body: unknown = {}): Observable<T> {
    return this.unwrap(this.http.post<ApiResponse<T>>(this.url(ruta), body));
  }

  private put<T>(ruta: string, body: unknown = {}): Observable<T> {
    return this.unwrap(this.http.put<ApiResponse<T>>(this.url(ruta), body));
  }

  private delete<T>(ruta: string): Observable<T> {
    return this.unwrap(this.http.delete<ApiResponse<T>>(this.url(ruta)));
  }

  // Taxonomía
  getCategorias(): Observable<ComunidadCategoria[]> {
    return this.get('categorias');
  }

  getSubCategorias(categoriaId: number): Observable<ComunidadSubCategoria[]> {
    return this.get(`categorias/${categoriaId}/subcategorias`);
  }

  saveCategoria(model: ComunidadCategoriaGuardar): Observable<number> {
    return this.post('categorias', model);
  }

  deleteCategoria(id: number): Observable<boolean> {
    return this.delete(`categorias/${id}`);
  }

  saveSubCategoria(model: ComunidadSubCategoriaGuardar): Observable<number> {
    return this.post('subcategorias', model);
  }

  deleteSubCategoria(id: number): Observable<boolean> {
    return this.delete(`subcategorias/${id}`);
  }

  getCategoriasAdmin(): Observable<ComunidadCategoriaAdmin[]> {
    return this.get('categorias/admin');
  }

  reordenarCategorias(ids: number[]): Observable<boolean> {
    return this.put('categorias/orden', ids);
  }

  reordenarSubCategorias(categoriaId: number, ids: number[]): Observable<boolean> {
    return this.put(`categorias/${categoriaId}/subcategorias/orden`, ids);
  }

  // Comunidades
  getComunidades(search: BusquedaComunidades = {}): Observable<PaginatedData<ComunidadCard>> {
    const page = search.page || 1;
    const pageCount = search.pageCount || 12;
    const query = encodeURIComponent(search.query || '');
    const categoriaId = search.categoriaId || '';
    return this.get(`?page=${page}&pageCount=${pageCount}&query=${query}&categoriaId=${categoriaId}`);
  }

  getComunidad(nombreCorto: string): Observable<ComunidadDetalle> {
    return this.get(`por-nombre/${encodeURIComponent(nombreCorto)}`);
  }

  saveComunidad(model: ComunidadGuardar): Observable<number> {
    return this.post('', model);
  }

  updateComunidad(model: ComunidadGuardar): Observable<number> {
    return this.put(`${model.id}`, model);
  }

  deleteComunidad(id: number): Observable<boolean> {
    return this.delete(`${id}`);
  }

  // Membresía / seguir
  unirme(comunidadId: number): Observable<boolean> {
    return this.post(`${comunidadId}/membresia`);
  }

  abandonar(comunidadId: number): Observable<boolean> {
    return this.delete(`${comunidadId}/membresia`);
  }

  seguir(comunidadId: number): Observable<boolean> {
    return this.post(`${comunidadId}/seguimiento`);
  }

  getMiembros(comunidadId: number, search: BusquedaPaginada = {}): Observable<PaginatedData<ComunidadMiembro>> {
    const page = search.page || 1;
    const pageCount = search.pageCount || 24;
    return this.get(`${comunidadId}/miembros?page=${page}&pageCount=${pageCount}`);
  }

  cambiarRangoMiembro(comunidadId: number, usuarioId: number, permiso: number, esStaff: boolean): Observable<boolean> {
    return this.put(`${comunidadId}/miembros/${usuarioId}/rango?permiso=${permiso}&esStaff=${esStaff}`);
  }

  // Temas
  getTemas(comunidadId: number, search: BusquedaPaginada = {}): Observable<PaginatedData<TemaListado>> {
    const page = search.page || 1;
    const pageCount = search.pageCount || 20;
    const query = encodeURIComponent(search.query || '');
    return this.get(`${comunidadId}/temas?page=${page}&pageCount=${pageCount}&query=${query}`);
  }

  getTema(id: number): Observable<TemaDetalle> {
    return this.get(`temas/${id}`);
  }

  saveTema(model: TemaGuardar): Observable<number> {
    return this.post('temas', model);
  }

  deleteTema(id: number): Observable<boolean> {
    return this.delete(`temas/${id}`);
  }

  changeStickyTema(id: number): Observable<boolean> {
    return this.put(`temas/${id}/sticky`);
  }

  addTemaComentario(model: TemaComentarioGuardar): Observable<number> {
    return this.post('comentarios', model);
  }

  editarComentario(comentarioId: number, contenido: string): Observable<boolean> {
    return this.put(`comentarios/${comentarioId}`, { contenido });
  }

  eliminarComentario(comentarioId: number): Observable<boolean> {
    return this.delete(`comentarios/${comentarioId}`);
  }

  votarComentario(comentarioId: number, valor: number): Observable<ResultadoVoto> {
    return this.post(`comentarios/${comentarioId}/votos?valor=${valor}`);
  }

  votarTema(temaId: number, valor: number): Observable<ResultadoVoto> {
    return this.post(`temas/${temaId}/votos?valor=${valor}`);
  }

  fijarComentario(comentarioId: number): Observable<boolean> {
    return this.put(`comentarios/${comentarioId}/fijado`);
  }

  denunciarComentario(comentarioId: number, motivo: string): Observable<boolean> {
    return this.post(`comentarios/${comentarioId}/denuncias`, { motivo });
  }

  // Widgets
  getTopTemas(comunidadId: number, periodo: string = 'Semana'): Observable<TemaTop[]> {
    return this.get(`${comunidadId}/temas/top?periodo=${periodo}`);
  }

  getComentariosRecientes(comunidadId: number, count: number = 5): Observable<ComentarioReciente[]> {
    return this.get(`${comunidadId}/comentarios/recientes?count=${count}`);
  }

  // Widgets globales (portada)
  getTemasRecientes(count: number = 10): Observable<TemaReciente[]> {
    return this.get(`temas/recientes?count=${count}`);
  }

  getComentariosRecientesGlobal(count: number = 8): Observable<ComentarioReciente[]> {
    return this.get(`comentarios/recientes?count=${count}`);
  }

  getTopComunidades(count: number = 5): Observable<ComunidadCard[]> {
    return this.get(`top?count=${count}`);
  }

  getTopTemasGlobal(periodo: string = 'Semana', count: number = 5): Observable<TemaTopGlobal[]> {
    return this.get(`temas/top?periodo=${periodo}&count=${count}`);
  }

  getEstadisticas(): Observable<ComunidadesEstadisticas> {
    return this.get('estadisticas');
  }
}

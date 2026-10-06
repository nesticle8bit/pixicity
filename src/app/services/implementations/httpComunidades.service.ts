import { Injectable } from '@angular/core';
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
  ComunidadCategoriaGuardar,
  ComunidadDetalle,
  ComunidadesEstadisticas,
  ComunidadGuardar,
  ComunidadMiembro,
  ComunidadSubCategoria,
  ComunidadSubCategoriaGuardar,
  DenunciaComentarioComunidad,
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
  private readonly base = `${environment.api}/api/comunidades`;

  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private notificationService: NotificationService
  ) {}

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

  private get<T>(ruta: string): Observable<T> {
    return this.unwrap(this.http.get<ApiResponse<T>>(`${this.base}/${ruta}`));
  }

  private post<T>(ruta: string, body: unknown = {}): Observable<T> {
    return this.unwrap(this.http.post<ApiResponse<T>>(`${this.base}/${ruta}`, body));
  }

  private delete<T>(ruta: string): Observable<T> {
    return this.unwrap(this.http.delete<ApiResponse<T>>(`${this.base}/${ruta}`));
  }

  // Taxonomía
  getCategorias(): Observable<ComunidadCategoria[]> {
    return this.get('getCategorias');
  }

  getSubCategorias(categoriaId: number): Observable<ComunidadSubCategoria[]> {
    return this.get(`getSubCategorias?categoriaId=${categoriaId}`);
  }

  saveCategoria(model: ComunidadCategoriaGuardar): Observable<number> {
    return this.post('saveCategoria', model);
  }

  deleteCategoria(id: number): Observable<boolean> {
    return this.delete(`deleteCategoria?id=${id}`);
  }

  saveSubCategoria(model: ComunidadSubCategoriaGuardar): Observable<number> {
    return this.post('saveSubCategoria', model);
  }

  deleteSubCategoria(id: number): Observable<boolean> {
    return this.delete(`deleteSubCategoria?id=${id}`);
  }

  // Comunidades
  getComunidades(search: BusquedaComunidades = {}): Observable<PaginatedData<ComunidadCard>> {
    const page = search.page || 1;
    const pageCount = search.pageCount || 12;
    const query = encodeURIComponent(search.query || '');
    const categoriaId = search.categoriaId || '';
    return this.get(`getComunidades?page=${page}&pageCount=${pageCount}&query=${query}&categoriaId=${categoriaId}`);
  }

  getComunidad(nombreCorto: string): Observable<ComunidadDetalle> {
    return this.get(`getComunidad?nombreCorto=${encodeURIComponent(nombreCorto)}`);
  }

  saveComunidad(model: ComunidadGuardar): Observable<number> {
    return this.post('saveComunidad', model);
  }

  updateComunidad(model: ComunidadGuardar): Observable<number> {
    return this.post('updateComunidad', model);
  }

  deleteComunidad(id: number): Observable<boolean> {
    return this.delete(`deleteComunidad?id=${id}`);
  }

  // Membresía / seguir
  unirme(comunidadId: number): Observable<boolean> {
    return this.post(`unirme?comunidadId=${comunidadId}`);
  }

  abandonar(comunidadId: number): Observable<boolean> {
    return this.post(`abandonar?comunidadId=${comunidadId}`);
  }

  seguir(comunidadId: number): Observable<boolean> {
    return this.post(`seguir?comunidadId=${comunidadId}`);
  }

  getMiembros(comunidadId: number, search: BusquedaPaginada = {}): Observable<PaginatedData<ComunidadMiembro>> {
    const page = search.page || 1;
    const pageCount = search.pageCount || 24;
    return this.get(`getMiembros?comunidadId=${comunidadId}&page=${page}&pageCount=${pageCount}`);
  }

  cambiarRangoMiembro(comunidadId: number, usuarioId: number, permiso: number, esStaff: boolean): Observable<boolean> {
    return this.post(`cambiarRangoMiembro?comunidadId=${comunidadId}&usuarioId=${usuarioId}&permiso=${permiso}&esStaff=${esStaff}`);
  }

  // Temas
  getTemas(comunidadId: number, search: BusquedaPaginada = {}): Observable<PaginatedData<TemaListado>> {
    const page = search.page || 1;
    const pageCount = search.pageCount || 20;
    const query = encodeURIComponent(search.query || '');
    return this.get(`getTemas?comunidadId=${comunidadId}&page=${page}&pageCount=${pageCount}&query=${query}`);
  }

  getTema(id: number): Observable<TemaDetalle> {
    return this.get(`getTema?id=${id}`);
  }

  saveTema(model: TemaGuardar): Observable<number> {
    return this.post('saveTema', model);
  }

  deleteTema(id: number): Observable<boolean> {
    return this.delete(`deleteTema?id=${id}`);
  }

  changeStickyTema(id: number): Observable<boolean> {
    return this.post(`changeStickyTema?id=${id}`);
  }

  addTemaComentario(model: TemaComentarioGuardar): Observable<number> {
    return this.post('addTemaComentario', model);
  }

  editarComentario(comentarioId: number, contenido: string): Observable<boolean> {
    return this.post(`editarComentario?comentarioId=${comentarioId}`, { contenido });
  }

  eliminarComentario(comentarioId: number): Observable<boolean> {
    return this.delete(`eliminarComentario?comentarioId=${comentarioId}`);
  }

  votarComentario(comentarioId: number, valor: number): Observable<ResultadoVoto> {
    return this.post(`votarTemaComentario?comentarioId=${comentarioId}&valor=${valor}`);
  }

  votarTema(temaId: number, valor: number): Observable<ResultadoVoto> {
    return this.post(`votarTema?temaId=${temaId}&valor=${valor}`);
  }

  fijarComentario(comentarioId: number): Observable<boolean> {
    return this.post(`fijarComentario?comentarioId=${comentarioId}`);
  }

  denunciarComentario(comentarioId: number, motivo: string): Observable<boolean> {
    return this.post(`denunciarComentario?comentarioId=${comentarioId}`, { motivo });
  }

  getDenunciasComentarios(
    page: number,
    pageCount: number,
    soloPendientes: boolean = false
  ): Observable<PaginatedData<DenunciaComentarioComunidad> & { pendientes: number }> {
    return this.get(`getDenunciasComentarios?page=${page}&pageCount=${pageCount}&soloPendientes=${soloPendientes}`);
  }

  resolverDenunciaComentario(denunciaId: number): Observable<boolean> {
    return this.post(`resolverDenunciaComentario?denunciaId=${denunciaId}`);
  }

  eliminarDenunciaComentario(denunciaId: number): Observable<boolean> {
    return this.delete(`eliminarDenunciaComentario?denunciaId=${denunciaId}`);
  }

  // Widgets
  getTopTemas(comunidadId: number, periodo: string = 'Semana'): Observable<TemaTop[]> {
    return this.get(`getTopTemas?comunidadId=${comunidadId}&periodo=${periodo}`);
  }

  getComentariosRecientes(comunidadId: number, count: number = 5): Observable<ComentarioReciente[]> {
    return this.get(`getComentariosRecientes?comunidadId=${comunidadId}&count=${count}`);
  }

  // Widgets globales (portada)
  getTemasRecientes(count: number = 10): Observable<TemaReciente[]> {
    return this.get(`getTemasRecientes?count=${count}`);
  }

  getComentariosRecientesGlobal(count: number = 8): Observable<ComentarioReciente[]> {
    return this.get(`getComentariosRecientesGlobal?count=${count}`);
  }

  getTopComunidades(count: number = 5): Observable<ComunidadCard[]> {
    return this.get(`getTopComunidades?count=${count}`);
  }

  getTopTemasGlobal(periodo: string = 'Semana', count: number = 5): Observable<TemaTopGlobal[]> {
    return this.get(`getTopTemasGlobal?periodo=${periodo}&count=${count}`);
  }

  getEstadisticas(): Observable<ComunidadesEstadisticas> {
    return this.get('getEstadisticas');
  }
}

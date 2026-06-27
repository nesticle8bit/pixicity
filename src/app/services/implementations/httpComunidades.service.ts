import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { NotificationService } from '../shared/notification.service';
import { ApiResponse } from 'src/app/models/api/api-response.model';
import { IHttpComunidadesService } from '../interfaces/httpComunidades.interface';

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

  // Taxonomía
  getCategorias(): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getCategorias`));
  }

  getSubCategorias(categoriaId: number): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getSubCategorias?categoriaId=${categoriaId}`));
  }

  saveCategoria(model: any): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/saveCategoria`, model));
  }

  deleteCategoria(id: number): Observable<any> {
    return this.unwrap(this.http.delete<ApiResponse<any>>(`${this.base}/deleteCategoria?id=${id}`));
  }

  saveSubCategoria(model: any): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/saveSubCategoria`, model));
  }

  deleteSubCategoria(id: number): Observable<any> {
    return this.unwrap(this.http.delete<ApiResponse<any>>(`${this.base}/deleteSubCategoria?id=${id}`));
  }

  // Comunidades
  getComunidades(search: any = {}): Observable<any> {
    const page = search?.page || 1;
    const pageCount = search?.pageCount || 12;
    const query = search?.query || '';
    const categoriaId = search?.categoriaId || '';
    return this.unwrap(
      this.http.get<ApiResponse<any>>(
        `${this.base}/getComunidades?page=${page}&pageCount=${pageCount}&query=${query}&categoriaId=${categoriaId}`
      )
    );
  }

  getComunidad(nombreCorto: string): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getComunidad?nombreCorto=${encodeURIComponent(nombreCorto)}`));
  }

  saveComunidad(model: any): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/saveComunidad`, model));
  }

  updateComunidad(model: any): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/updateComunidad`, model));
  }

  deleteComunidad(id: number): Observable<any> {
    return this.unwrap(this.http.delete<ApiResponse<any>>(`${this.base}/deleteComunidad?id=${id}`));
  }

  // Membresía / seguir
  unirme(comunidadId: number): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/unirme?comunidadId=${comunidadId}`, {}));
  }

  abandonar(comunidadId: number): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/abandonar?comunidadId=${comunidadId}`, {}));
  }

  seguir(comunidadId: number): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/seguir?comunidadId=${comunidadId}`, {}));
  }

  getMiembros(comunidadId: number, search: any = {}): Observable<any> {
    const page = search?.page || 1;
    const pageCount = search?.pageCount || 24;
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getMiembros?comunidadId=${comunidadId}&page=${page}&pageCount=${pageCount}`));
  }

  cambiarRangoMiembro(comunidadId: number, usuarioId: number, permiso: number, esStaff: boolean): Observable<any> {
    return this.unwrap(
      this.http.post<ApiResponse<any>>(
        `${this.base}/cambiarRangoMiembro?comunidadId=${comunidadId}&usuarioId=${usuarioId}&permiso=${permiso}&esStaff=${esStaff}`,
        {}
      )
    );
  }

  // Temas
  getTemas(comunidadId: number, search: any = {}): Observable<any> {
    const page = search?.page || 1;
    const pageCount = search?.pageCount || 20;
    const query = search?.query || '';
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getTemas?comunidadId=${comunidadId}&page=${page}&pageCount=${pageCount}&query=${query}`));
  }

  getTema(id: number): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getTema?id=${id}`));
  }

  saveTema(model: any): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/saveTema`, model));
  }

  deleteTema(id: number): Observable<any> {
    return this.unwrap(this.http.delete<ApiResponse<any>>(`${this.base}/deleteTema?id=${id}`));
  }

  changeStickyTema(id: number): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/changeStickyTema?id=${id}`, {}));
  }

  addTemaComentario(model: any): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/addTemaComentario`, model));
  }

  editarComentario(comentarioId: number, contenido: string): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/editarComentario?comentarioId=${comentarioId}`, { contenido }));
  }

  eliminarComentario(comentarioId: number): Observable<any> {
    return this.unwrap(this.http.delete<ApiResponse<any>>(`${this.base}/eliminarComentario?comentarioId=${comentarioId}`));
  }

  votarComentario(comentarioId: number, valor: number): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/votarTemaComentario?comentarioId=${comentarioId}&valor=${valor}`, {}));
  }

  votarTema(temaId: number, valor: number): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/votarTema?temaId=${temaId}&valor=${valor}`, {}));
  }

  fijarComentario(comentarioId: number): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/fijarComentario?comentarioId=${comentarioId}`, {}));
  }

  denunciarComentario(comentarioId: number, motivo: string): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/denunciarComentario?comentarioId=${comentarioId}`, { motivo }));
  }

  getDenunciasComentarios(page: number, pageCount: number, soloPendientes: boolean = false): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getDenunciasComentarios?page=${page}&pageCount=${pageCount}&soloPendientes=${soloPendientes}`));
  }

  resolverDenunciaComentario(denunciaId: number): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.base}/resolverDenunciaComentario?denunciaId=${denunciaId}`, {}));
  }

  eliminarDenunciaComentario(denunciaId: number): Observable<any> {
    return this.unwrap(this.http.delete<ApiResponse<any>>(`${this.base}/eliminarDenunciaComentario?denunciaId=${denunciaId}`));
  }

  // Widgets
  getTopTemas(comunidadId: number, periodo: string = 'Semana'): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getTopTemas?comunidadId=${comunidadId}&periodo=${periodo}`));
  }

  getComentariosRecientes(comunidadId: number, count: number = 5): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getComentariosRecientes?comunidadId=${comunidadId}&count=${count}`));
  }

  // Widgets globales (portada)
  getTemasRecientes(count: number = 10): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getTemasRecientes?count=${count}`));
  }

  getComentariosRecientesGlobal(count: number = 8): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getComentariosRecientesGlobal?count=${count}`));
  }

  getTopComunidades(count: number = 5): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getTopComunidades?count=${count}`));
  }

  getTopTemasGlobal(periodo: string = 'Semana', count: number = 5): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getTopTemasGlobal?periodo=${periodo}&count=${count}`));
  }

  getEstadisticas(): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.base}/getEstadisticas`));
  }
}

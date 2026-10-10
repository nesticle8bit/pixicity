import { FotoAdmin } from 'src/app/models/admin/filas-admin.model';
import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { FotoSearchParams } from 'src/app/models/shared/service-types.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { FotoComentarioViewModel, FotoComentarioVoto, FotoViewModel } from 'src/app/models/fotos/foto-vm.model';

@Injectable()
export abstract class IHttpFotosService {
  abstract getFotos(search?: FotoSearchParams): Observable<PaginatedData<FotoViewModel>>;
  abstract getTopFotos(count?: number): Observable<FotoViewModel[]>;
  abstract getFotosAdmin(search?: FotoSearchParams & { query?: string }, filtro?: AdminFiltro): Observable<PaginatedData<FotoAdmin>>;
  abstract getFotosByUsuario(userName: string, search?: FotoSearchParams): Observable<PaginatedData<FotoViewModel>>;
  abstract getFotoById(fotoId: number): Observable<FotoViewModel>;
  abstract saveFoto(foto: Partial<FotoViewModel>): Observable<number>;
  abstract updateFoto(foto: Partial<FotoViewModel>): Observable<number>;
  abstract deleteFoto(fotoId: number): Observable<boolean>;
  abstract votarFoto(fotoId: number, cantidad: number): Observable<FotoViewModel>;
  abstract incrementVisitas(fotoId: number): Observable<boolean>;
  abstract uploadImage(file: File): Observable<string>;

  // Comentarios
  abstract getComentariosByFotoId(fotoId: number): Observable<FotoComentarioViewModel[]>;
  abstract addComentario(comentario: { fotoId: number; contenido: string; parentId?: number | null }): Observable<number>;
  abstract editarComentario(comentarioId: number, contenido: string): Observable<boolean>;
  abstract deleteComentario(id: number): Observable<boolean>;
  abstract votarComentario(comentarioId: number, cantidad: number): Observable<FotoComentarioVoto>;
  abstract fijarComentario(comentarioId: number): Observable<boolean>;
  abstract denunciarComentario(comentarioId: number, motivo: string): Observable<boolean>;
}

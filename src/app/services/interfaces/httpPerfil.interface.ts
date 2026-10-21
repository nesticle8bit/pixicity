import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { ShoutAdmin, ShoutComentarioViewModel, ShoutComentarioVoto, ShoutInteracciones, ShoutReaccion, ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';

@Injectable()
export abstract class IHttpPerfilService {
  abstract getShouts(userId: number): Observable<PaginatedData<ShoutViewModel, 'shouts'>>;
  abstract getTopShouts(count?: number): Observable<any[]>;
  abstract getShoutsAdmin(filtro?: AdminFiltro): Observable<PaginatedData<ShoutAdmin, 'shouts'>>;
  abstract createShout(shout: Partial<ShoutViewModel>): Observable<ShoutViewModel>;
  /** Sube una imagen para un shout (el API la deja en WebP de 1080 px máx.) y devuelve su URL pública. */
  abstract subirImagenShout(file: File): Observable<string>;
  /** `razon`: la causa que escribe el staff (queda en /mod-history). */
  abstract deleteShout(shoutId: number, razon?: string): Observable<boolean>;
  abstract recoveryShout(shoutId: number): Observable<boolean>;
  abstract getShoutById(shoutId: number): Observable<ShoutViewModel>;
  abstract getComentariosByShoutId(shoutId: number): Observable<ShoutComentarioViewModel[]>;
  abstract addShoutComentario(model: { shoutId: number; comentario: string; parentId?: number }): Observable<number>;
  abstract deleteShoutComentario(id: number, razon?: string): Observable<boolean>;
  abstract votarShoutComentario(comentarioId: number, valor: number): Observable<ShoutComentarioVoto>;
  abstract editarShoutComentario(comentarioId: number, contenido: string): Observable<boolean>;
  abstract fijarShoutComentario(comentarioId: number): Observable<boolean>;
  abstract denunciarShoutComentario(comentarioId: number, motivo: string): Observable<boolean>;
  abstract denunciarShout(shoutId: number, motivo: string): Observable<boolean>;
  /** Solo el autor y durante los primeros 15 minutos; error con el motivo si no se puede. */
  abstract editarShout(shoutId: number, contenido: string): Observable<boolean>;
  abstract getShoutInteracciones(shoutId: number): Observable<ShoutInteracciones>;
  abstract alternarMeGustaShout(shoutId: number): Observable<ShoutReaccion>;
  abstract alternarFavoritoShout(shoutId: number): Observable<ShoutReaccion>;
  abstract alternarReshoutShout(shoutId: number): Observable<ShoutReaccion>;
  abstract getReshouts(shoutId: number, cantidad?: number): Observable<{ usuarios: { userName: string; avatar: string | null }[]; total: number }>;
  abstract getShoutsFavoritos(page: number, pageCount: number): Observable<PaginatedData<ShoutViewModel, 'shouts'>>;
}

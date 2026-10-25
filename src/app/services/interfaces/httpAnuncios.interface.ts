import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { AnuncioAdmin, AnuncioEstadisticaDia, AnuncioGuardar, AnuncioOpciones } from 'src/app/models/web/anuncio.model';

/** Administración de anuncios. La lista pública y las métricas las maneja AnunciosService (services/shared). */
@Injectable()
export abstract class IHttpAnunciosService {
  abstract getAnunciosAdmin(filtro?: AdminFiltro): Observable<PaginatedData<AnuncioAdmin>>;
  abstract getOpciones(): Observable<AnuncioOpciones>;
  abstract getEstadisticas(id: number, dias?: number): Observable<AnuncioEstadisticaDia[]>;
  abstract saveAnuncio(anuncio: AnuncioGuardar): Observable<number>;
  abstract updateAnuncio(anuncio: AnuncioGuardar): Observable<boolean>;
  abstract cambiarActivo(id: number, activo: boolean): Observable<boolean>;
  abstract deleteAnuncio(id: number): Observable<boolean>;
}

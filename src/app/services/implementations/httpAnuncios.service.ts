import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { NotificationService } from '../shared/notification.service';
import { PaginationService } from '../shared/pagination.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { AnuncioAdmin, AnuncioEstadisticaDia, AnuncioGuardar, AnuncioOpciones } from 'src/app/models/web/anuncio.model';
import { IHttpAnunciosService } from '../interfaces/httpAnuncios.interface';

@Injectable()
export class HttpAnunciosService implements IHttpAnunciosService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  private notificationService = inject(NotificationService);
  private paginationService = inject(PaginationService);

  private readonly base = `${environment.api}/api/anuncios`;

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

  getAnunciosAdmin(filtro: AdminFiltro = {}): Observable<PaginatedData<AnuncioAdmin>> {
    return this.unwrap(this.http.get<ApiResponse<PaginatedData<AnuncioAdmin>>>(`${this.base}/admin`, {
      params: adminParams(filtro, this.paginationService),
    }));
  }

  getOpciones(): Observable<AnuncioOpciones> {
    return this.unwrap(this.http.get<ApiResponse<AnuncioOpciones>>(`${this.base}/admin/opciones`));
  }

  getEstadisticas(id: number, dias = 30): Observable<AnuncioEstadisticaDia[]> {
    return this.unwrap(this.http.get<ApiResponse<AnuncioEstadisticaDia[]>>(`${this.base}/${id}/estadisticas`, {
      params: new HttpParams().set('dias', dias),
    }));
  }

  saveAnuncio(anuncio: AnuncioGuardar): Observable<number> {
    return this.unwrap(this.http.post<ApiResponse<number>>(this.base, anuncio));
  }

  updateAnuncio(anuncio: AnuncioGuardar): Observable<boolean> {
    return this.unwrap(this.http.put<ApiResponse<boolean>>(`${this.base}/${anuncio.id}`, anuncio));
  }

  cambiarActivo(id: number, activo: boolean): Observable<boolean> {
    return this.unwrap(this.http.put<ApiResponse<boolean>>(`${this.base}/${id}/activo`, { activo }));
  }

  deleteAnuncio(id: number): Observable<boolean> {
    return this.unwrap(this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`));
  }
}

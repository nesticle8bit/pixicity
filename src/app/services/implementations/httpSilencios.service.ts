import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from 'src/app/models/api/api-response.model';
import { Silencios } from 'src/app/models/seguridad/silencios.model';
import { environment } from 'src/environments/environment';
import { IHttpSilenciosService } from '../interfaces/httpSilencios.interface';
import { HelperService } from '../shared/helper.service';

const JSON_HEADERS = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

@Injectable()
export class HttpSilenciosService implements IHttpSilenciosService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  private readonly base = `${environment.api}/api/silencios`;

  getSilencios(): Observable<Silencios> {
    return this.http.get<ApiResponse<Silencios>>(`${this.base}`).pipe(this.datos<Silencios>());
  }

  alternarUsuario(userName: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/usuarios`, JSON.stringify(userName), JSON_HEADERS).pipe(this.datos<boolean>());
  }

  agregarPalabra(palabra: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/palabras`, JSON.stringify(palabra), JSON_HEADERS).pipe(this.datos<boolean>());
  }

  quitarPalabra(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/palabras/${id}`).pipe(this.datos<boolean>());
  }

  private datos<T>(): OperatorFunction<ApiResponse<T>, T> {
    return (fuente) =>
      fuente.pipe(
        map((r) => {
          if (r.status === 200) return r.data as T;
          throw new Error(r.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler),
      );
  }
}

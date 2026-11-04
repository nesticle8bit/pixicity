import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from 'src/app/models/api/api-response.model';
import { Medalla, MedallaOtorgada, MedallaUsuario, ReglaMedalla } from 'src/app/models/seguridad/medalla.model';
import { environment } from 'src/environments/environment';
import { IHttpMedallasService } from '../interfaces/httpMedallas.interface';
import { HelperService } from '../shared/helper.service';

/** Medallas: catálogo y otorgarlas desde el panel admin; las de cada usuario en su perfil. */
@Injectable()
export class HttpMedallasService implements IHttpMedallasService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  private readonly base = `${environment.api}/api/medallas`;

  private datos<T>(peticion: Observable<ApiResponse<T>>): Observable<T> {
    return peticion
      .pipe(map((r) => { if (r.status === 200) { return r.data as T; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  getCatalogo(): Observable<Medalla[]> {
    return this.datos(this.http.get<ApiResponse<Medalla[]>>(this.base));
  }

  guardar(medalla: Partial<Medalla>): Observable<number> {
    return medalla.id
      ? this.datos(this.http.put<ApiResponse<number>>(`${this.base}/${medalla.id}`, medalla))
      : this.datos(this.http.post<ApiResponse<number>>(this.base, medalla));
  }

  eliminar(id: number): Observable<boolean> {
    return this.datos(this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`));
  }

  getOtorgadas(id: number): Observable<MedallaOtorgada[]> {
    return this.datos(this.http.get<ApiResponse<MedallaOtorgada[]>>(`${this.base}/${id}/usuarios`));
  }

  otorgar(id: number, userName: string, motivo: string): Observable<boolean> {
    return this.datos(this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/usuarios`, { userName, motivo }));
  }

  quitar(id: number, usuarioId: number): Observable<boolean> {
    return this.datos(this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/usuarios/${usuarioId}`));
  }

  getReglas(): Observable<{ reglas: ReglaMedalla[]; periodos: string[] }> {
    return this.datos(this.http.get<ApiResponse<{ reglas: ReglaMedalla[]; periodos: string[] }>>(`${this.base}/reglas`));
  }

  repartir(): Observable<number> {
    return this.datos(this.http.post<ApiResponse<number>>(`${this.base}/reparto`, {}));
  }

  getMedallasUsuario(userName: string): Observable<MedallaUsuario[]> {
    return this.datos(this.http.get<ApiResponse<MedallaUsuario[]>>(
      `${this.base}/usuarios/por-nombre/${encodeURIComponent(userName)}`));
  }
}

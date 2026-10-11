import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from 'src/app/models/api/api-response.model';
import { AlcanceMuro, MiResumen, Muro, SugerenciaUsuario, Tendencia } from 'src/app/models/mi/mi-vm.model';
import { environment } from 'src/environments/environment';
import { IHttpMiService } from '../interfaces/httpMi.interface';
import { HelperService } from '../shared/helper.service';

@Injectable()
export class HttpMiService implements IHttpMiService {
  private readonly http = inject(HttpClient);
  private readonly helper = inject(HelperService);

  getTendencias(cantidad = 8): Observable<Tendencia[]> {
    return this.http
      .get<ApiResponse<Tendencia[]>>(`${environment.api}/api/mi/getTendencias?cantidad=${cantidad}`)
      .pipe(map((r) => (r.status === 200 ? r.data ?? [] : [])), catchError(() => of([])));
  }

  getMuro(alcance: AlcanceMuro, antes: string | null, cantidad = 15, tag?: string | null): Observable<Muro> {
    let params = new HttpParams().set('alcance', alcance).set('cantidad', cantidad);
    if (antes) params = params.set('antes', antes);
    if (tag) params = params.set('tag', tag);
    return this.http
      .get<ApiResponse<Muro>>(`${environment.api}/api/mi/getMuro`, { params })
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  getResumen(): Observable<MiResumen> {
    return this.http
      .get<ApiResponse<MiResumen>>(`${environment.api}/api/mi/getResumen`)
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  getSugerencias(cantidad = 5): Observable<SugerenciaUsuario[]> {
    return this.http
      .get<ApiResponse<SugerenciaUsuario[]>>(`${environment.api}/api/mi/getSugerencias?cantidad=${cantidad}`)
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }
}

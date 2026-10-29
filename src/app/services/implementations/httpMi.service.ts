import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from 'src/app/models/api/api-response.model';
import { AlcanceMuro, MiResumen, Muro, SugerenciaUsuario, Tendencia, OrdenTendencias, MuroItem, PeriodoActivos, TopShoutero } from 'src/app/models/mi/mi-vm.model';
import { environment } from 'src/environments/environment';
import { IHttpMiService } from '../interfaces/httpMi.interface';
import { HelperService } from '../shared/helper.service';

@Injectable()
export class HttpMiService implements IHttpMiService {
  private readonly http = inject(HttpClient);
  private readonly helper = inject(HelperService);

  getTendencias(cantidad = 8, orden: OrdenTendencias = 'mejores'): Observable<Tendencia[]> {
    return this.http
      .get<ApiResponse<Tendencia[]>>(`${environment.api}/api/mi/tendencias?cantidad=${cantidad}&orden=${orden}`)
      .pipe(map((r) => (r.status === 200 ? r.data ?? [] : [])), catchError(() => of([])));
  }

  buscarHashtags(prefijo: string, cantidad = 6): Observable<Tendencia[]> {
    const params = new HttpParams().set('q', prefijo).set('cantidad', cantidad);
    return this.http
      .get<ApiResponse<Tendencia[]>>(`${environment.api}/api/mi/hashtags`, { params })
      .pipe(map((r) => (r.status === 200 ? r.data ?? [] : [])), catchError(() => of([])));
  }

  getMuro(alcance: AlcanceMuro, antes: string | null, cantidad = 15, tag?: string | null): Observable<Muro> {
    let params = new HttpParams().set('alcance', alcance).set('cantidad', cantidad);
    if (antes) params = params.set('antes', antes);
    if (tag) params = params.set('tag', tag);
    return this.http
      .get<ApiResponse<Muro>>(`${environment.api}/api/mi/muro`, { params })
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  getTopShouteros(periodo: string, cantidad = 5): Observable<TopShoutero[]> {
    const params = new HttpParams().set('periodo', periodo).set('cantidad', cantidad);
    return this.http
      .get<ApiResponse<TopShoutero[]>>(`${environment.api}/api/mi/top-shouteros`, { params })
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  getActivos(periodo: PeriodoActivos, pagina: number, cantidad = 15, nsfw = false): Observable<Muro> {
    let params = new HttpParams().set('periodo', periodo).set('pagina', pagina).set('cantidad', cantidad);
    if (nsfw) params = params.set('nsfw', true);
    return this.http
      .get<ApiResponse<{ items: MuroItem[]; hayMas: boolean }>>(`${environment.api}/api/mi/activos`, { params })
      .pipe(map((r) => {
        if (r.status !== 200) throw new Error(r.errors?.join(', ') ?? 'Error');
        // Se ordena por actividad, no por fecha: el "cursor" es el número de la página siguiente.
        return { items: r.data!.items, siguiente: r.data!.hayMas ? String(pagina + 1) : null };
      }))
      .pipe(catchError(this.helper.errorHandler));
  }

  getResumen(): Observable<MiResumen> {
    return this.http
      .get<ApiResponse<MiResumen>>(`${environment.api}/api/mi/resumen`)
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }

  getSugerencias(cantidad = 5): Observable<SugerenciaUsuario[]> {
    return this.http
      .get<ApiResponse<SugerenciaUsuario[]>>(`${environment.api}/api/mi/sugerencias?cantidad=${cantidad}`)
      .pipe(map((r) => { if (r.status === 200) { return r.data!; } throw new Error(r.errors?.join(', ') ?? 'Error'); }))
      .pipe(catchError(this.helper.errorHandler));
  }
}

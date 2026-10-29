import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { CloudTagViewModel, ComentarioViewModel, PostListaViewModel } from 'src/app/models/posts/post-vm.model';
import { EstadisticasViewModel, UsuarioViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { CategoriaViewModel, TopCategoriaViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { FotoViewModel } from 'src/app/models/fotos/foto-vm.model';
import { TopUserModel } from 'src/app/models/web/topUser.model';
import { TopPostModel } from 'src/app/models/web/topPost.model';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';

/** Posts por página del listado de la portada (también lo usa home-last-posts). */
export const POSTS_POR_PAGINA_PORTADA = 39;

/** Respuesta de /api/portada: cada parte tiene la misma forma que su endpoint suelto. */
export interface PortadaViewModel {
  posts: PaginatedData<PostListaViewModel>;
  fijados: PostListaViewModel[];
  estadisticas: EstadisticasViewModel;
  comentarios: ComentarioViewModel[];
  topPosts: TopPostModel[];
  topUsuarios: TopUserModel[];
  topCategorias: TopCategoriaViewModel[];
  categorias: CategoriaViewModel[];
  fotos: FotoViewModel[];
  afiliados: AfiliacionModel[];
  tags: CloudTagViewModel[];
  usuariosRecientes: UsuarioViewModel[];
}

type Seccion = Exclude<keyof PortadaViewModel, 'posts'>;

interface Carga {
  datos$: Observable<PortadaViewModel | null>;
  /** categoría|página|novatos del listado que trae la respuesta. */
  posts: string;
  usadas: Set<string>;
}

/**
 * Primera carga de la portada en una sola petición: antes eran 14 que salían juntas recién al arrancar Angular.
 * SectionHomeForum la inicia al crearse y cada widget pide su parte con `tomar`, que la entrega una sola vez:
 * las recargas posteriores (SignalR, cambio de fecha, paginación) y los widgets usados fuera de la portada van a su
 * endpoint de siempre, que también es el respaldo si /api/portada falla.
 */
@Injectable({ providedIn: 'root' })
export class PortadaService {
  private http = inject(HttpClient);
  private carga: Carga | null = null;

  /** Devuelve la carga iniciada, para que `terminar` no cierre la de otra instancia de la portada. */
  iniciar(categoria: string, pagina: number, novatos = false): object {
    let params = new HttpParams()
      .set('page', pagina)
      .set('pageCount', POSTS_POR_PAGINA_PORTADA)
      .set('query', categoria);
    if (novatos) params = params.set('novatos', true);

    this.carga = {
      posts: `${categoria}|${pagina}|${novatos}`,
      usadas: new Set(),
      datos$: this.http.get<ApiResponse<PortadaViewModel>>(`${environment.api}/api/portada`, { params }).pipe(
        map((response) => (response.status === 200 ? response.data ?? null : null)),
        catchError(() => of(null)),
        shareReplay(1),
      ),
    };
    return this.carga;
  }

  terminar(carga: object): void {
    if (this.carga === carga) this.carga = null;
  }

  tomar<K extends Seccion>(seccion: K, respaldo: Observable<PortadaViewModel[K]>): Observable<PortadaViewModel[K]> {
    return this.desde(seccion, (datos) => datos[seccion], respaldo);
  }

  tomarPosts(categoria: string, pagina: number, respaldo: Observable<PortadaViewModel['posts']>, novatos = false): Observable<PortadaViewModel['posts']> {
    if (this.carga?.posts !== `${categoria}|${pagina}|${novatos}`) return respaldo;
    return this.desde('posts', (datos) => datos.posts, respaldo);
  }

  private desde<T>(clave: string, elegir: (datos: PortadaViewModel) => T | undefined, respaldo: Observable<T>): Observable<T> {
    const carga = this.carga;
    if (!carga || carga.usadas.has(clave)) return respaldo;

    carga.usadas.add(clave);
    return carga.datos$.pipe(
      switchMap((datos) => {
        const valor = datos ? elegir(datos) : undefined;
        return valor === undefined || valor === null ? respaldo : of(valor);
      }),
    );
  }
}

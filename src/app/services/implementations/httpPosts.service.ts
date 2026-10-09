import { AdminFiltro, adminParams } from 'src/app/models/admin/admin-filtro.model';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BusquedaPostsFiltro, BusquedaPostsResultado } from 'src/app/models/posts/busqueda.model';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { IHttpPostsService } from '../interfaces/httpPosts.interface';
import { PaginationService } from '../shared/pagination.service';
import { ApiResponse, PaginatedData, PaginatedWithCategorias } from 'src/app/models/api/api-response.model';
import { CloudTagViewModel, PostDetailResponse, PostSimpleViewModel, PostViewModel } from 'src/app/models/posts/post-vm.model';
@Injectable()
export class HttpPostsService implements IHttpPostsService {
  private notificationService = inject(NotificationService);
  private paginationService = inject(PaginationService);
  private helper = inject(HelperService);
  private http = inject(HttpClient);


  getPosts(categoria: string = ''): Observable<PaginatedData<PostViewModel>> {
    if (!categoria) {
      categoria = '';
    }

    return this.http
      .get<ApiResponse<PaginatedData<PostViewModel>>>(
        `${environment.api}/api/posts/getPosts?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${categoria}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostsAdmin(search: string, filtro: AdminFiltro = {}): Observable<PaginatedData<PostViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<PostViewModel>>>(
        `${environment.api}/api/posts/getPostsAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${search}`, { params: adminParams(filtro) },
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostsByLoggedUser(search: string): Observable<PaginatedData<PostViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<PostViewModel>>>(
        `${environment.api}/api/posts/getPostsByLoggedUser?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${search}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostsByUserId(userId: number): Observable<PaginatedData<PostViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<PostViewModel>>>(
        `${environment.api}/api/posts/getPostsByUserId?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${userId}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getStickyPosts(): Observable<PostViewModel[]> {
    return this.http
      .get<ApiResponse<PostViewModel[]>>(`${environment.api}/api/posts/getStickyPosts`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostById(postId: number): Observable<PostDetailResponse> {
    return this.http
      .get<ApiResponse<PostDetailResponse>>(`${environment.api}/api/posts/getPostById?postId=${postId}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  savePost(post: Partial<PostViewModel>): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/posts/savePost`, post)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  updatePost(post: Partial<PostViewModel>): Observable<number> {
    return this.http
      .put<ApiResponse<number>>(`${environment.api}/api/posts/updatePost`, post)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deletePost(postId: number, razon: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(
        `${environment.api}/api/posts/deletePost?postId=${postId}&razon=${razon}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  changeStickyPost(postId: number): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${environment.api}/api/posts/changeStickyPost?postId=${postId}`, {})
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getAvailableVotos(type: number): Observable<number> {
    return this.http
      .get<ApiResponse<number>>(`${environment.api}/api/votos/getAvailableVotos?type=${type}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  setVotos(voto: { typeId: number; cantidad: number; votosType: number }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/votos/setVoto`, voto)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  nextPost(postId: number): Observable<PostSimpleViewModel> {
    return this.http
      .post<ApiResponse<PostSimpleViewModel>>(`${environment.api}/api/posts/nextPost`, { id: postId })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  previousPost(postId: number): Observable<PostSimpleViewModel> {
    return this.http
      .post<ApiResponse<PostSimpleViewModel>>(`${environment.api}/api/posts/previousPost`, { id: postId })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  randomPost(postId: number): Observable<PostSimpleViewModel> {
    return this.http
      .post<ApiResponse<PostSimpleViewModel>>(`${environment.api}/api/posts/randomPost`, { id: postId })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  addFavoritePost(postId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/posts/addFavoritePost`, { id: postId })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  reportPost(report: { postId: number; razon: string }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/posts/reportPost`, report)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getRelatedPosts(postId: number): Observable<PostSimpleViewModel[]> {
    return this.http
      .get<ApiResponse<PostSimpleViewModel[]>>(`${environment.api}/api/posts/getRelatedPosts?postId=${postId}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostsFromOP(postId: number): Observable<PostSimpleViewModel[]> {
    return this.http
      .get<ApiResponse<PostSimpleViewModel[]>>(`${environment.api}/api/posts/getPostsFromOP?postId=${postId}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  buscarPosts(filtro: BusquedaPostsFiltro): Observable<BusquedaPostsResultado> {
    // HttpParams codifica el texto: "&", "#" o "+" ya no rompen la búsqueda.
    let params = new HttpParams().set('q', filtro.q).set('page', filtro.page).set('pageCount', filtro.pageCount);
    if (filtro.tipo && filtro.tipo !== 'todo') params = params.set('tipo', filtro.tipo);
    if (filtro.categoria) params = params.set('categoria', filtro.categoria);
    if (filtro.autor?.trim()) params = params.set('autor', filtro.autor.trim());
    if (filtro.orden && filtro.orden !== 'relevancia') params = params.set('orden', filtro.orden);
    if (filtro.periodo) params = params.set('periodo', filtro.periodo);

    return this.http
      .get<ApiResponse<BusquedaPostsResultado>>(`${environment.api}/api/busqueda/posts`, { params })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          }
          this.notificationService.error(response.errors.join(', '), 'Error');
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getTopPosts(date: string, categoriaId?: number): Observable<PostViewModel[]> {
    let search = '';

    if (categoriaId) {
      search += `&categoria=${categoriaId}`;
    }

    return this.http
      .get<ApiResponse<PostViewModel[]>>(
        `${environment.api}/api/posts/getTopPosts?date=${date}${search}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  seguirPost(postId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/posts/seguirPost`, { id: postId })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getCloudTags(): Observable<CloudTagViewModel[]> {
    return this.http
      .get<ApiResponse<CloudTagViewModel[]>>(`${environment.api}/api/posts/getCloudTags`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getBorradores(search: string, categoriaId: number): Observable<PaginatedWithCategorias<PostViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedWithCategorias<PostViewModel>>>(
        `${environment.api}/api/posts/getBorradores?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${search}&categoriaId=${categoriaId}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  recomendarPost(postId: number): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/posts/recomendarPost`, { id: postId })
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getVotos(filtro: AdminFiltro = {}): Observable<PaginatedData<unknown>> {
    return this.http
      .get<ApiResponse<PaginatedData<unknown>>>(
        `${environment.api}/api/votos/getVotosAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`, { params: adminParams(filtro) },
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostsRelatedByTitle(title: string): Observable<PostSimpleViewModel[]> {
    return this.http
      .get<ApiResponse<PostSimpleViewModel[]>>(
        `${environment.api}/api/posts/getPostsRelatedByTitle?title=${title}`,
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}

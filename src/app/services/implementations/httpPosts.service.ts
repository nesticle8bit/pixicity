import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../shared/notification.service';
import { IHttpPostsService } from '../interfaces/httpPosts.interface';
import { PaginationService } from '../shared/pagination.service';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { PostViewModel, ComentarioViewModel, PostSimpleViewModel, CloudTagViewModel, FavoritosViewModel } from 'src/app/models/posts/post-vm.model';

interface PostSearchFilter {
  search?: string;
  searchType?: string;
  categoriaId?: number;
  autor?: string;
}

@Injectable()
export class HttpPostsService implements IHttpPostsService {
  constructor(
    private notificationService: NotificationService,
    private paginationService: PaginationService,
    private helper: HelperService,
    private http: HttpClient,
  ) {}

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

  getPostsAdmin(search: string): Observable<PaginatedData<PostViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<PostViewModel>>>(
        `${environment.api}/api/posts/getPostsAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${search}`,
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

  getPostById(postId: number): Observable<PostViewModel> {
    return this.http
      .get<ApiResponse<PostViewModel>>(`${environment.api}/api/posts/getPostById?postId=${postId}`)
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

  getComentarios(): Observable<PaginatedData<ComentarioViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<ComentarioViewModel>>>(
        `${environment.api}/api/comentarios/getComentarios?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

  getComentariosByUserId(userId: number): Observable<PaginatedData<ComentarioViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<ComentarioViewModel>>>(
        `${environment.api}/api/comentarios/getComentariosByUserId?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${userId}`,
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

  getUltimosComentarios(): Observable<ComentarioViewModel[]> {
    return this.http
      .get<ApiResponse<ComentarioViewModel[]>>(`${environment.api}/api/comentarios/getComentariosRecientes`)
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

  addComentario(comentario: Partial<ComentarioViewModel>): Observable<ComentarioViewModel> {
    return this.http
      .post<ApiResponse<ComentarioViewModel>>(`${environment.api}/api/comentarios/addComentario`, comentario)
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

  updateComentario(comentario: Partial<ComentarioViewModel>): Observable<ComentarioViewModel> {
    return this.http
      .post<ApiResponse<ComentarioViewModel>>(
        `${environment.api}/api/comentarios/updateComentario`,
        comentario,
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

  getComentariosByPostId(postId: number): Observable<ComentarioViewModel[]> {
    return this.http
      .get<ApiResponse<ComentarioViewModel[]>>(
        `${environment.api}/api/comentarios/getComentariosByPostId?postId=${postId}`,
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
      .put<ApiResponse<boolean>>(`${environment.api}/api/posts/changeStickyPost`, { id: postId })
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

  setVotos(voto: { postId: number; cantidad: number }): Observable<boolean> {
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

  searchPosts(value: PostSearchFilter): Observable<PaginatedData<PostViewModel>> {
    let searchValues = '';

    if (value.search) {
      searchValues += `&search=${value.search}`;
    }

    if (value.searchType) {
      searchValues += `&searchType=${value.searchType}`;
    }

    if (value.categoriaId) {
      searchValues += `&categoriaId=${value.categoriaId}`;
    }

    if (value.autor) {
      searchValues += `&autor=${value.autor}`;
    }

    return this.http
      .get<ApiResponse<PaginatedData<PostViewModel>>>(
        `${environment.api}/api/posts/searchPosts?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${searchValues}`,
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

  getBorradores(search: string, categoriaId: number): Observable<PaginatedData<PostViewModel>> {
    return this.http
      .get<ApiResponse<PaginatedData<PostViewModel>>>(
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

  deleteComentario(comentarioId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/comentarios/deleteComentario`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: comentarioId },
      })
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

  votarComentario(comentarioId: number, cantidad: number): Observable<ComentarioViewModel> {
    return this.http
      .post<ApiResponse<ComentarioViewModel>>(`${environment.api}/api/comentarios/votarComentario`, {
        comentarioId,
        cantidad,
      })
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

  private unwrapData<T>(obs: Observable<ApiResponse<T>>): Observable<T> {
    return obs.pipe(
      map((response) => {
        if (response.status === 200) {
          return response.data!;
        }
        this.notificationService.error(response.errors?.join(', ') ?? 'Error', 'Error');
        throw new Error(response.errors?.join(', ') ?? 'Error');
      }),
      catchError(this.helper.errorHandler),
    );
  }

  fijarComentario(comentarioId: number): Observable<any> {
    return this.unwrapData(
      this.http.post<ApiResponse<any>>(`${environment.api}/api/comentarios/fijarComentario?comentarioId=${comentarioId}`, {}),
    );
  }

  denunciarComentario(comentarioId: number, motivo: string): Observable<any> {
    return this.unwrapData(
      this.http.post<ApiResponse<any>>(`${environment.api}/api/comentarios/denunciarComentario?comentarioId=${comentarioId}`, { motivo }),
    );
  }

  getDenunciasComentarios(page: number, pageCount: number, soloPendientes: boolean = false): Observable<any> {
    return this.unwrapData(
      this.http.get<ApiResponse<any>>(`${environment.api}/api/comentarios/getDenunciasComentarios?page=${page}&pageCount=${pageCount}&soloPendientes=${soloPendientes}`),
    );
  }

  resolverDenunciaComentario(denunciaId: number): Observable<any> {
    return this.unwrapData(
      this.http.post<ApiResponse<any>>(`${environment.api}/api/comentarios/resolverDenunciaComentario?denunciaId=${denunciaId}`, {}),
    );
  }

  eliminarDenunciaComentario(denunciaId: number): Observable<any> {
    return this.unwrapData(
      this.http.delete<ApiResponse<any>>(`${environment.api}/api/comentarios/eliminarDenunciaComentario?denunciaId=${denunciaId}`),
    );
  }

  recomendarPost(postId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/posts/recomendarPost`, { id: postId })
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

  getVotos(): Observable<PaginatedData<unknown>> {
    return this.http
      .get<ApiResponse<PaginatedData<unknown>>>(
        `${environment.api}/api/votos/getVotosAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`,
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

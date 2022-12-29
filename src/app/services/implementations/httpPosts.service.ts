import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { IHttpPostsService } from '../interfaces/httpPosts.interface';
import { PaginationService } from '../shared/pagination.service';

@Injectable()
export class HttpPostsService implements IHttpPostsService {
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private paginationService: PaginationService
  ) {}

  getPosts(categoria: string = ''): Observable<any> {
    if (!categoria) {
      categoria = '';
    }

    return this.http
      .get<any>(
        `${environment.api}/api/posts/getPosts?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${categoria}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostsAdmin(search: any): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/posts/getPostsAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${search}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostsByLoggedUser(search: any): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/posts/getPostsByLoggedUser?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${search}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostsByUserId(userId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/posts/getPostsByUserId?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${userId}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getStickyPosts(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/posts/getStickyPosts`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostById(postId: number): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/posts/getPostById?postId=${postId}`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  savePost(post: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/posts/savePost`, post)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  updatePost(post: any): Observable<any> {
    return this.http
      .put<any>(`${environment.api}/api/posts/updatePost`, post)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getComentarios(): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/comentarios/getComentarios?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getComentariosByUserId(userId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/comentarios/getComentariosByUserId?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${userId}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getUltimosComentarios(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/comentarios/getComentariosRecientes`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  addComentario(comentario: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/comentarios/addComentario`, comentario)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  updateComentario(comentario: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.api}/api/comentarios/updateComentario`,
        comentario
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getComentariosByPostId(postId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/comentarios/getComentariosByPostId?postId=${postId}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deletePost(postId: number, razon: string): Observable<any> {
    return this.http
      .delete<any>(
        `${environment.api}/api/posts/deletePost?postId=${postId}&razon=${razon}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  changeStickyPost(postId: number): Observable<any> {
    return this.http
      .put<any>(`${environment.api}/api/posts/changeStickyPost`, { id: postId })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getAvailableVotos(type: number): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/votos/getAvailableVotos?type=${type}`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  setVotos(voto: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/votos/setVoto`, voto)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  nextPost(postId: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/posts/nextPost`, { id: postId })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  previousPost(postId: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/posts/previousPost`, { id: postId })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  randomPost(postId: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/posts/randomPost`, { id: postId })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  addFavoritePost(postId: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/posts/addFavoritePost`, { id: postId })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  reportPost(report: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/posts/reportPost`, report)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getRelatedPosts(postId: number): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/posts/getRelatedPosts?postId=${postId}`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getPostsFromOP(postId: number): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/posts/getPostsFromOP?postId=${postId}`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  searchPosts(value: any): Observable<any[]> {
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
      .get<any>(
        `${environment.api}/api/posts/searchPosts?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}${searchValues}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getTopPosts(date: string, categoriaId?: number): Observable<any> {
    let search = '';

    if (categoriaId) {
      search += `&categoria=${categoriaId}`;
    }

    return this.http
      .get<any>(
        `${environment.api}/api/posts/getTopPosts?date=${date}${search}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  seguirPost(postId: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/posts/seguirPost`, { id: postId })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getCloudTags(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/posts/getCloudTags`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getBorradores(search: string, categoriaId: number): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/posts/getBorradores?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}&query=${search}&categoriaId=${categoriaId}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  deleteComentario(comentarioId: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.api}/api/comentarios/deleteComentario`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: { id: comentarioId },
      })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  recomendarPost(postId: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/posts/recomendarPost`, { id: postId })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getVotos(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/votos/getVotosAdmin?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`)
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}

import { PostAdmin } from 'src/app/models/admin/filas-admin.model';
import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BusquedaPostsFiltro, BusquedaPostsResultado } from 'src/app/models/posts/busqueda.model';
import { PaginatedData, PaginatedWithCategorias } from 'src/app/models/api/api-response.model';
import { CloudTagViewModel, PostDetailResponse, PostSimpleViewModel, PostViewModel } from 'src/app/models/posts/post-vm.model';
@Injectable()
export abstract class IHttpPostsService {
  abstract getPosts(categoria?: string): Observable<PaginatedData<PostViewModel>>;
  abstract getPostsAdmin(search: string, filtro?: AdminFiltro): Observable<PaginatedData<PostAdmin>>;
  abstract getPostsByUserId(userId: number): Observable<PaginatedData<PostViewModel>>;
  abstract getPostsByLoggedUser(search: string): Observable<PaginatedData<PostViewModel>>;
  abstract getStickyPosts(): Observable<PostViewModel[]>;
  abstract getPostById(postId: number): Observable<PostDetailResponse>;
  abstract savePost(post: Partial<PostViewModel>): Observable<number>;
  abstract updatePost(post: Partial<PostViewModel>): Observable<number>;
  abstract deletePost(postId: number, razon: string): Observable<boolean>;
  abstract recuperarPost(postId: number): Observable<boolean>;
  abstract changeStickyPost(postId: number): Observable<boolean>;
  abstract getAvailableVotos(type: number): Observable<number>;
  abstract setVotos(voto: { typeId: number; cantidad: number; votosType: number }): Observable<boolean>;
  abstract nextPost(postId: number): Observable<PostSimpleViewModel>;
  abstract previousPost(postId: number): Observable<PostSimpleViewModel>;
  abstract randomPost(postId: number): Observable<PostSimpleViewModel>;
  abstract addFavoritePost(postId: number): Observable<boolean>;
  abstract reportPost(report: { postId: number; razon: string }): Observable<boolean>;
  abstract getRelatedPosts(postId: number): Observable<PostSimpleViewModel[]>;
  abstract getPostsFromOP(postId: number): Observable<PostSimpleViewModel[]>;
  abstract buscarPosts(filtro: BusquedaPostsFiltro): Observable<BusquedaPostsResultado>;
  abstract getTopPosts(date: string, categoriaId?: number): Observable<PostViewModel[]>;
  abstract seguirPost(postId: number): Observable<boolean>;
  abstract getCloudTags(): Observable<CloudTagViewModel[]>;
  abstract getBorradores(search: string, categoriaId: number): Observable<PaginatedWithCategorias<PostViewModel>>;
  abstract recomendarPost(postId: number): Observable<number>;
  abstract getVotos(filtro?: AdminFiltro): Observable<PaginatedData<unknown>>;
  abstract getPostsRelatedByTitle(title: string): Observable<PostSimpleViewModel[]>;
}

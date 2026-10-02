import { PostSearchFilter } from 'src/app/models/shared/service-types.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { CloudTagViewModel, ComentarioViewModel, PostSimpleViewModel, PostViewModel } from 'src/app/models/posts/post-vm.model';

@Injectable()
export abstract class IHttpPostsService {
  abstract getPosts(categoria?: string): Observable<PaginatedData<PostViewModel>>;
  abstract getPostsAdmin(search: string): Observable<PaginatedData<PostViewModel>>;
  abstract getPostsByUserId(userId: number): Observable<PaginatedData<PostViewModel>>;
  abstract getPostsByLoggedUser(search: string): Observable<PaginatedData<PostViewModel>>;
  abstract getStickyPosts(): Observable<PostViewModel[]>;
  abstract getPostById(postId: number): Observable<PostViewModel>;
  abstract savePost(post: Partial<PostViewModel>): Observable<number>;
  abstract updatePost(post: Partial<PostViewModel>): Observable<number>;
  abstract getComentarios(): Observable<PaginatedData<ComentarioViewModel>>;
  abstract getComentariosByUserId(userId: number): Observable<PaginatedData<ComentarioViewModel>>;
  abstract getUltimosComentarios(): Observable<ComentarioViewModel[]>;
  abstract addComentario(comentario: Partial<ComentarioViewModel>): Observable<ComentarioViewModel>;
  abstract updateComentario(comentario: Partial<ComentarioViewModel>): Observable<ComentarioViewModel>;
  abstract getComentariosByPostId(postId: number): Observable<ComentarioViewModel[]>;
  abstract deletePost(postId: number, razon: string): Observable<boolean>;
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
  abstract searchPosts(value: PostSearchFilter): Observable<PaginatedData<PostViewModel>>;
  abstract getTopPosts(date: string, categoriaId?: number): Observable<PostViewModel[]>;
  abstract seguirPost(postId: number): Observable<boolean>;
  abstract getCloudTags(): Observable<CloudTagViewModel[]>;
  abstract getBorradores(search: string, categoriaId: number): Observable<PaginatedData<PostViewModel>>;
  abstract deleteComentario(comentarioId: number): Observable<boolean>;
  abstract votarComentario(comentarioId: number, cantidad: number): Observable<ComentarioViewModel>;
  abstract fijarComentario(comentarioId: number): Observable<any>;
  abstract denunciarComentario(comentarioId: number, motivo: string): Observable<any>;
  abstract getDenunciasComentarios(page: number, pageCount: number, soloPendientes?: boolean): Observable<any>;
  abstract resolverDenunciaComentario(denunciaId: number): Observable<any>;
  abstract eliminarDenunciaComentario(denunciaId: number): Observable<any>;
  abstract recomendarPost(postId: number): Observable<boolean>;
  abstract getVotos(): Observable<PaginatedData<unknown>>;
  abstract getPostsRelatedByTitle(title: string): Observable<PostSimpleViewModel[]>;
}

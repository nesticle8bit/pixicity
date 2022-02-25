import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpPostsService {
    abstract getPosts(categoria: string): Observable<any>;
    abstract getPostsAdmin(search: any): Observable<any>;
    abstract getPostsByUserId(userId: number): Observable<any>;
    abstract getPostsByLoggedUser(search: any): Observable<any>;
    abstract getStickyPosts(): Observable<any>;
    abstract getPostById(postId: number): Observable<any>;
    abstract savePost(post: any): Observable<any>;
    abstract updatePost(post: any): Observable<any>;
    abstract getComentarios(): Observable<any>;
    abstract getComentariosByUserId(userId: number): Observable<any>;
    abstract getUltimosComentarios(): Observable<any>;
    abstract addComentario(comentario: any): Observable<any>;
    abstract getComentariosByPostId(postId: number): Observable<any>;
    abstract deletePost(postId: number): Observable<any>;
    abstract changeStickyPost(postId: number): Observable<any>;
    abstract getAvailableVotos(type: number): Observable<any>;
    abstract setVotos(voto: any): Observable<any>;
    abstract nextPost(postId: number): Observable<any>;
    abstract previousPost(postId: number): Observable<any>;
    abstract randomPost(postId: number): Observable<any>;
    abstract addFavoritePost(postId: number): Observable<any>;
    abstract reportPost(report: any): Observable<any>;
    abstract getRelatedPosts(postId: number): Observable<any>;
    abstract searchPosts(value: any): Observable<any[]>;
    abstract getTopPosts(type: string, categoriaId?: number): Observable<any>;
    abstract seguirPost(postId: number): Observable<any>;
    abstract getCloudTags(): Observable<any>;
    abstract getBorradores(search: string, categoriaId: number): Observable<any>;
}

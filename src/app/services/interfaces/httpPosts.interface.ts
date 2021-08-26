import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpPostsService {
    abstract getPosts(categoria: string): Observable<any>;
    abstract getStickyPosts(): Observable<any>;
    abstract getPostById(postId: number): Observable<any>;
    abstract savePost(post: any): Observable<any>;
    abstract updatePost(post: any): Observable<any>;
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
}

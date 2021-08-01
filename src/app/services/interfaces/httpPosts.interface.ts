import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpPostsService {
    abstract getPosts(): Observable<any>;
    abstract getStickyPosts(): Observable<any>;
    abstract getPostById(postId: number): Observable<any>;
    abstract savePost(post: any): Observable<any>;
    abstract addComentario(comentario: any): Observable<any>;
}

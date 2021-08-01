import { environment } from "src/environments/environment";
import { HelperService } from "../shared/helper.service";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import Swal from "sweetalert2";
import { IHttpPostsService } from "../interfaces/httpPosts.interface";
import { PaginationService } from "../shared/pagination.service";

@Injectable()
export class HttpPostsService implements IHttpPostsService {
    constructor(
        private http: HttpClient,
        private helper: HelperService,
        private paginationService: PaginationService) { }

    getPosts(): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/posts/getPosts?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`)
            .pipe(map((response: any) => {
                if (response.status === 200) {
                    return response.data;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.errors.join(', ')
                    });
                }
            })).pipe(catchError(this.helper.errorHandler));
    }

    getStickyPosts(): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/posts/getStickyPosts`)
            .pipe(map((response: any) => {
                if (response.status === 200) {
                    return response.data;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.errors.join(', ')
                    });
                }
            })).pipe(catchError(this.helper.errorHandler));
    }

    getPostById(postId: number): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/posts/getPostById?postId=${postId}`)
            .pipe(map((response: any) => {
                if (response.status === 200) {
                    return response.data;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.errors.join(', ')
                    });
                }
            })).pipe(catchError(this.helper.errorHandler));
    }

    savePost(post: any): Observable<any> {
        return this.http.post<any>(`${environment.api}/api/posts/savePost`, post)
            .pipe(map((response: any) => {
                if (response.status === 200) {
                    return response.data;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.errors.join(', ')
                    });
                }
            })).pipe(catchError(this.helper.errorHandler));
    }

    addComentario(comentario: any): Observable<any> {
        return this.http.post<any>(`${environment.api}/api/posts/addComentario`, comentario)
            .pipe(map((response: any) => {
                if (response.status === 200) {
                    return response.data;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.errors.join(', ')
                    });
                }
            })).pipe(catchError(this.helper.errorHandler));
    }
}
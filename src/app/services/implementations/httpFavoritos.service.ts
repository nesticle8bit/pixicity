import { environment } from "src/environments/environment";
import { HelperService } from "../shared/helper.service";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { IHttpFavoritosService } from "../interfaces/httpFavoritos.interface";
import { PaginationService } from "../shared/pagination.service";
import { Observable } from "rxjs";
import { NotificationService } from '../shared/notification.service';

@Injectable()
export class HttpFavoritosService implements IHttpFavoritosService {
    constructor(
        private http: HttpClient,
        private helper: HelperService,
        private paginationService: PaginationService,
        private notificationService: NotificationService) { }

    getLastFavoritos(count: number): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/favoritos/getLastFavoritos?count=${count}`)
        .pipe(map((response: any) => {
            if (response.status === 200) {
                return response.data;
            } else {
                this.notificationService.error(response.errors.join(', '), 'Error');
            }
        })).pipe(catchError(this.helper.errorHandler));
    }

    deleteFavorito(favoritoId: number): Observable<any> {
        return this.http.delete<any>(`${environment.api}/api/favoritos/deleteFavorito?favoritoId=${favoritoId}`)
            .pipe(map((response: any) => {
                if (response.status === 200) {
                    return response.data;
                } else {
                    this.notificationService.error(response.errors.join(', '), 'Error');
                }
            })).pipe(catchError(this.helper.errorHandler));
    }

    getCategorias(): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/favoritos/getCategorias`)
            .pipe(map((response: any) => {
                if (response.status === 200) {
                    return response.data;
                } else {
                    this.notificationService.error(response.errors.join(', '), 'Error');
                }
            })).pipe(catchError(this.helper.errorHandler));
    }
}

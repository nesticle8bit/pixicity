import { IHttpParametrosService } from "../interfaces/httpParametros.interface";
import { environment } from "src/environments/environment";
import { HelperService } from "../shared/helper.service";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import Swal from "sweetalert2";

@Injectable()
export class HttpParametrosService implements IHttpParametrosService {
    constructor(
        private http: HttpClient,
        private helper: HelperService) { }

    getPaisesDropdown(): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/paises/getPaisesDropdown`)
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

    getEstadosByPais(idPais: number): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/paises/getEstadosByPais?idPais=${idPais}`)
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

    getCategoriasDropdown(): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/categorias/getCategoriasDropdown`)
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
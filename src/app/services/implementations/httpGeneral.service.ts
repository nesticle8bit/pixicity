import { IHttpGeneralService } from "../interfaces/httpGeneral.interface";
import { AfiliacionModel } from "src/app/models/general/afiliacion.model";
import { environment } from "src/environments/environment";
import { HelperService } from "../shared/helper.service";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import Swal from "sweetalert2";

@Injectable()
export class HttpGeneralService implements IHttpGeneralService {
    constructor(
        private http: HttpClient,
        private helper: HelperService) { }

    saveAfiliacion(afiliacion: AfiliacionModel): Observable<any> {
        return this.http.post<any>(`${environment.api}/api/general/saveAfiliacion`, afiliacion)
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
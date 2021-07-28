import { IHttpSecurityService } from "../interfaces/httpSecurity.interface";
import { UserModel } from "src/app/models/security/user.model";
import { environment } from "src/environments/environment";
import { HelperService } from "../shared/helper.service";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import Swal from "sweetalert2";

@Injectable()
export class HttpSecurityService implements IHttpSecurityService {
    constructor(
        private http: HttpClient,
        private helper: HelperService) { }

    registerUser(user: UserModel): Observable<any> {
        return this.http.post<any>(`${environment.api}/api/usuarios/registrarUsuario`, user)
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
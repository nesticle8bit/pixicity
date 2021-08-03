import { IHttpSecurityService } from "../interfaces/httpSecurity.interface";
import { JwtUserModel } from "src/app/models/security/jwtUser.model";
import { UserModel } from "src/app/models/security/user.model";
import { environment } from "src/environments/environment";
import { HelperService } from "../shared/helper.service";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

@Injectable()
export class HttpSecurityService implements IHttpSecurityService {
    public currentUser: Observable<JwtUserModel>;
    private currentUserSubject: BehaviorSubject<JwtUserModel>;

    constructor(
        private http: HttpClient,
        private helper: HelperService,
        private router: Router) {
        this.currentUserSubject = new BehaviorSubject<JwtUserModel>(JSON.parse(localStorage.getItem('pixicity') || '{}'));
        this.currentUser = this.currentUserSubject.asObservable();
    }

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

    loginUser(user: any): Observable<any> {
        return this.http.post<any>(`${environment.api}/api/usuarios/login`, user)
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

    getCurrentUser(): JwtUserModel {
        return this.currentUserSubject.value;
    }

    getCurrentUserAsObservable(): Observable<JwtUserModel> {
        return this.currentUserSubject.asObservable();
    }

    setUserToLocalStorage(obj: any): any {
        localStorage.setItem('pixicity', JSON.stringify(obj));
        this.currentUserSubject.next(obj);
    }

    logout(): void {
        localStorage.removeItem('pixicity');

        this.router.navigateByUrl('');
        this.currentUserSubject.next(new JwtUserModel({}, ''));
    }
}
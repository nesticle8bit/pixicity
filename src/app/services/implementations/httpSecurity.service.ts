import { IHttpSecurityService } from "../interfaces/httpSecurity.interface";
import { JwtUserModel } from "src/app/models/security/jwtUser.model";
import { PaginationService } from "../shared/pagination.service";
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
        private router: Router,
        private paginationService: PaginationService
    ) {
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

    getUsuarios(): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/usuarios/getUsuarios?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`)
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

    getLoggedUserByJwt(): Observable<any> {
        return this.http.get<any>(`${environment.api}/api/usuarios/getLoggedUserByJwt`)
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
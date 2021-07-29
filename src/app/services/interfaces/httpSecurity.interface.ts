import { JwtUserModel } from "src/app/models/security/jwtUser.model";
import { UserModel } from "src/app/models/security/user.model";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpSecurityService {
    abstract registerUser(user: UserModel): Observable<any>;
    abstract loginUser(user: any): Observable<any>;
    abstract getCurrentUser(): JwtUserModel;
    abstract getCurrentUserAsObservable(): Observable<JwtUserModel>;
    abstract setUserToLocalStorage(obj: any): any;
}
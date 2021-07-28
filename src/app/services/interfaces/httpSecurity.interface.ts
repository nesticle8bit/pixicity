import { UserModel } from "src/app/models/security/user.model";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpSecurityService {
    abstract registerUser(user: UserModel): Observable<any>;
}

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpPerfilService {
    abstract getShouts(userId: number): Observable<any>;
    abstract createShout(shout: any): Observable<any>;
    abstract deleteShout(shoutId: number): Observable<any>;
}

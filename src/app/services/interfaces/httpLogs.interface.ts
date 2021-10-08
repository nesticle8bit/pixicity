import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpLogsService {
    abstract getNotificaciones(): Observable<any>;
}

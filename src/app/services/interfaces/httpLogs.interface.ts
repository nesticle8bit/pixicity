import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpLogsService {
    abstract getNotificaciones(): Observable<any>;
    abstract getLastNotificaciones(): Observable<any>;
    abstract setNotificacionesAsReaded(): Observable<any>;
    abstract getStats(): Observable<any>;
}

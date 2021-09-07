import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AfiliacionModel } from "src/app/models/general/afiliacion.model";

@Injectable()
export abstract class IHttpGeneralService {
    abstract getEstadisticas(): Observable<any>;
    abstract saveAfiliacion(afiliacion: AfiliacionModel): Observable<any>;
    abstract getFavoritosByUser(search: string): Observable<any>;
}

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AfiliacionModel } from "src/app/models/general/afiliacion.model";

@Injectable()
export abstract class IHttpGeneralService {
    abstract getEstadisticas(): Observable<any>;
    abstract getAfiliados(): Observable<any>;
    abstract saveAfiliacion(afiliacion: AfiliacionModel): Observable<any>;
    abstract getFavoritosByUser(search: string, categoriaId: number): Observable<any>;
    abstract getConfiguracion(): Observable<any>;
    abstract updateConfiguracion(configuracion: any): Observable<any>;
}

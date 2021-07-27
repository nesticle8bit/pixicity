import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpParametrosService {
    abstract getPaisesDropdown(): Observable<any>;
    abstract getEstadosByPais(idPais: number): Observable<any>;
}

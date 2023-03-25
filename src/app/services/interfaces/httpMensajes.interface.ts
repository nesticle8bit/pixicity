import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpMensajesService {
    abstract getMensajes(search: any): Observable<any>;
}

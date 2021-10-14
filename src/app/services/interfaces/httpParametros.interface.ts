import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpParametrosService {
  abstract getPaises(): Observable<any>;
  abstract getPaisesDropdown(): Observable<any>;
  abstract savePais(pais: any): Observable<any>;
  abstract getEstadosByPais(idPais: number): Observable<any>;
  abstract getCategoriasDropdown(): Observable<any>;
}

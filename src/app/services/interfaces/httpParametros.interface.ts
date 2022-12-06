import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpParametrosService {
  abstract getPaises(): Observable<any>;
  abstract getPaisesDropdown(): Observable<any>;
  abstract savePais(pais: any): Observable<any>;
  abstract updatePais(pais: any): Observable<any>;
  abstract getEstadosByPais(idPais: number): Observable<any>;

  abstract getCategoriasAdmin(): Observable<any>;
  abstract getCategoriasDropdown(): Observable<any>;
  abstract saveCategoria(categoria: any): Observable<any>;
}

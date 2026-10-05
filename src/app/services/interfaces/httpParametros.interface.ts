import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { CategoriaViewModel, EstadoViewModel, PaisViewModel } from 'src/app/models/parametros/parametros-vm.model';

@Injectable()
export abstract class IHttpParametrosService {
  abstract getPaises(): Observable<PaginatedData<PaisViewModel>>;
  abstract getPaisesDropdown(): Observable<PaisViewModel[]>;
  abstract savePais(pais: Partial<PaisViewModel>): Observable<number>;
  abstract updatePais(pais: PaisViewModel): Observable<number>;
  abstract getEstadosByPais(idPais: number): Observable<EstadoViewModel[]>;

  abstract getCategoriasAdmin(): Observable<PaginatedData<CategoriaViewModel, 'categorias'>>;
  abstract getCategoriasDropdown(): Observable<CategoriaViewModel[]>;
  abstract getTopCategorias(count?: number): Observable<any[]>;
  abstract saveCategoria(categoria: Partial<CategoriaViewModel>): Observable<number>;

  abstract getCensuras(): Observable<PaginatedData<any>>;
  abstract saveCensura(censura: any): Observable<number>;
  abstract deleteCensura(id: number): Observable<boolean>;
}

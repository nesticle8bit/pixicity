import { CategoriaAdmin, PaisAdmin } from 'src/app/models/admin/filas-admin.model';
import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { CategoriaViewModel, CensuraViewModel, EstadoViewModel, PaisViewModel, TopCategoriaViewModel } from 'src/app/models/parametros/parametros-vm.model';

@Injectable()
export abstract class IHttpParametrosService {
  abstract getPaises(filtro?: AdminFiltro): Observable<PaginatedData<PaisAdmin>>;
  abstract getPaisesDropdown(): Observable<PaisViewModel[]>;
  abstract savePais(pais: Partial<PaisViewModel>): Observable<number>;
  abstract updatePais(pais: PaisViewModel): Observable<number>;
  abstract getEstadosByPais(idPais: number): Observable<EstadoViewModel[]>;

  abstract cambiarEstadoCategoria(id: number): Observable<boolean>;
  abstract getCategoriasAdmin(filtro?: AdminFiltro): Observable<PaginatedData<CategoriaAdmin, 'categorias'>>;
  abstract getCategoriasDropdown(): Observable<CategoriaViewModel[]>;
  abstract getTopCategorias(count?: number): Observable<TopCategoriaViewModel[]>;
  abstract saveCategoria(categoria: Partial<CategoriaViewModel>): Observable<number>;

  abstract getCensuras(filtro?: AdminFiltro): Observable<PaginatedData<CensuraViewModel>>;
  abstract saveCensura(censura: CensuraViewModel): Observable<number>;
  abstract deleteCensura(id: number): Observable<boolean>;
}

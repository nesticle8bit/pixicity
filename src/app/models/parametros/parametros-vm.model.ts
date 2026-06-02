export interface CategoriaViewModel {
  id: number;
  nombre: string;
  seo: string;
  icono: string;
}

export interface PaisViewModel {
  id: number;
  nombre: string;
  iso2: string;
  iso3: string;
}

export interface EstadoViewModel {
  id: number;
  nombre: string;
  idPais: number;
}

export interface DropdownViewModel {
  id: number;
  nombre: string;
}

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

/** Categoría con su total de posts públicos (widget de la home). */
export interface TopCategoriaViewModel {
  id: number;
  nombre: string;
  seo: string;
  icono: string;
  totalPosts: number;
}

/** Palabra censurada y su reemplazo. */
export interface CensuraViewModel {
  id?: number;
  palabra: string;
  reemplazo: string;
  fechaRegistro?: string;
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

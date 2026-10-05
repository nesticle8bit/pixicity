export interface ApiResponse<T> {
  status: number;
  errors: string[];
  data: T;
}

export interface Pagination {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Respuesta paginada del API: la colección viene bajo una clave que depende del endpoint (casi todos usan 'data',
 * pero algunos devuelven 'mensajes', 'usuarios', 'shouts'...). Indícala como segundo parámetro:
 *   PaginatedData<MensajeViewModel, 'mensajes'>
 */
export type PaginatedData<T, K extends string = 'data'> = { [P in K]: T[] } & {
  pagination: Pagination;
};

/** Listas filtrables por categoría (borradores, favoritos): además de la página traen el conteo por categoría. */
export type PaginatedWithCategorias<T, K extends string = 'data'> = PaginatedData<T, K> & {
  categorias: { categoria: { id: number; icono: string; nombre: string }; count: number }[];
};

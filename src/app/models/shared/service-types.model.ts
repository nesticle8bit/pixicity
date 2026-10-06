// Tipos de parámetros y respuestas que comparten las interfaces (IHttp*Service) y sus implementaciones.

export interface FotoSearchParams {
  page?: number;
  pageCount?: number;
}

export interface UsuarioSearchFilter {
  genero?: string;
  pais?: string;
  rango?: string;
}

export interface UsuarioAdminSearchFilter {
  rangoId?: number;
}

export interface PaginaViewModel {
  id: number;
  titulo: string;
  slug: string;
  contenido: string;
  eliminado: boolean;
  tipo?: string;
  target?: string;
  fechaRegistro: string;
  fechaActualiza?: string | null;
}

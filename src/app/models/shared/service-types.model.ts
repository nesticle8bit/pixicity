// Tipos de parámetros y respuestas que comparten las interfaces (IHttp*Service) y sus implementaciones.

export interface FotoSearchParams {
  page?: number;
  pageCount?: number;
}

/** Filtros de /usuarios (GET api/usuarios). */
export interface UsuarioSearchFilter {
  genero?: number | string | null;
  pais?: number | string | null;
  rango?: number | string | null;
  /** Solo quienes tuvieron actividad dentro del tiempo "en línea" configurado en el panel. */
  enLinea?: boolean;
  /** Búsqueda por nombre de usuario (contiene, sin distinguir mayúsculas). */
  query?: string | null;
  /** recientes (por defecto), puntos o activos. */
  orden?: 'recientes' | 'puntos' | 'activos';
  page?: number;
  pageCount?: number;
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

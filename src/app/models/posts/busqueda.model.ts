import { Pagination } from '../api/api-response.model';

export type TipoBusqueda = 'todo' | 'titulo' | 'contenido' | 'tags';
export type OrdenBusqueda = 'relevancia' | 'recientes' | 'puntos' | 'comentarios';
export type PeriodoBusqueda = '' | 'semana' | 'mes' | 'anio';

export interface BusquedaPostsFiltro {
  q: string;
  tipo?: TipoBusqueda;
  categoria?: string | null;
  autor?: string;
  orden?: OrdenBusqueda;
  periodo?: PeriodoBusqueda;
  page: number;
  pageCount: number;
}

export interface CategoriaBusqueda {
  id: number;
  nombre: string;
  seo: string;
  icono: string;
  total: number;
}

/** Resultado de /api/busqueda/posts: sin HTML, con un extracto alrededor de la coincidencia. */
export interface PostBusqueda {
  id: number;
  titulo: string;
  url: string;
  extracto: string;
  etiquetas: string[];
  fechaRegistro: string;
  puntos: number;
  comentarios: number;
  favoritos: number;
  visitantes: number;
  esPrivado: boolean;
  sticky: boolean;
  categoria: CategoriaBusqueda;
  autor: string;
  autorAvatar: string | null;
}

export interface BusquedaPostsResultado {
  data: PostBusqueda[];
  categorias: CategoriaBusqueda[];
  /** Palabras buscadas, ya normalizadas: se resaltan en los resultados. */
  terminos: string[];
  pagination: Pagination;
}

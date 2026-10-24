import { CategoriaViewModel } from '../parametros/parametros-vm.model';
import { UsuarioViewModel } from '../seguridad/seguridad-vm.model';
import { PaginatedWithCategorias } from '../api/api-response.model';

export interface PostViewModel {
  fechaActualiza?: string | null;
  // Calculado en el cliente a partir de etiquetas (posts-view).
  tags?: string[];
  id: number;
  url: string;
  titulo: string;
  contenido: string;
  etiquetas: string;
  puntos: number;
  cantidadComentarios: number;
  favoritos: number;
  visitantes: number;
  seguidores: number;
  sticky: boolean;
  smileys: boolean;
  esPrivado: boolean;
  sinComentarios: boolean;
  seguirPost: boolean;
  esBorrador: boolean;
  fechaRegistro: string;
  categoria: CategoriaViewModel;
  usuario: UsuarioViewModel;
  comentarios: number;
}

export interface ComentarioHistorialViewModel {
  fecha: string;
  contenido: string;
}

export interface ComentarioViewModel {
  id: number;
  postId: number;
  usuarioId: number;
  contenido: string;
  fechaComentario: string;
  votos: number;
  ip?: string;
  eliminado: boolean;
  post?: PostViewModel;
  usuario: string;
  avatar: string;
  respuestas?: ComentarioViewModel[];
  historial?: ComentarioHistorialViewModel[];
  miVoto?: number | null;
  votosArriba?: number;
  votosAbajo?: number;
  denunciasPendientes?: number;
  fijado?: boolean;
  /** Solo al enviar una respuesta: id del comentario raíz al que responde. */
  comentarioId?: number;
  /** Rango del autor. */
  rango?: { id: number; nombre: string; icono: string | null; color: string | null } | null;
}

/** Fila de /favoritos (proyección liviana: sin el contenido del post). */
export interface FavoritoPostLista {
  id: number;
  fechaRegistro: string;
  postId: number;
  titulo: string;
  url: string;
  postFechaRegistro: string;
  puntos: number;
  comentarios: number;
  autor: string;
  categoria: { id: number; nombre: string; icono: string; seo: string };
}

export interface FavoritosViewModel {
  id: number;
  fechaRegistro: string;
  post?: PostViewModel;
}

export interface PostSimpleViewModel {
  id: number;
  url: string;
  titulo: string;
  puntos?: number;
  categoria: {
    icono: string;
    nombre: string;
    seo: string;
  };
}

export interface CloudTagViewModel {
  tag: string;
  count: number;
}

/** Autor tal como viene en el detalle de un post (UsuarioPostViewModel). */
export interface UsuarioPost {
  avatar: string | null;
  userName: string;
  paisId: number | null;
  estadoId: number;
  genero: number;
  generoString: string | null;
  rango: { id: number; nombre: string; icono: string; color: string } | null;
  estado: { nombre: string; pais: { nombre: string; iso2: string } | null } | null;
}

/** Post completo de getPostById (ViewPostViewModel). */
export interface PostDetalle {
  id: number;
  url: string;
  titulo: string;
  contenido: string;
  etiquetas: string;
  fechaRegistro: string;
  fechaActualiza: string | null;
  puntos: number;
  favoritos: number;
  visitantes: number;
  seguidores: number;
  cantidadComentarios: number;
  sticky: boolean;
  smileys: boolean;
  esPrivado: boolean;
  seguirPost: boolean;
  sinComentarios: boolean;
  esBorrador: boolean;
  categoria: { id: number; nombre: string; seo: string; icono: string };
  usuario: UsuarioPost;
  /** Calculado en el cliente a partir de etiquetas. */
  tags?: string[];
}

/**
 * Respuesta de getPostById: el post viene envuelto en { post }. El API devuelve null si no existe (o es un borrador ajeno)
 * y, para un post privado sin sesión válida, solo { post: { esPrivado: true } } (sin id).
 */
export interface PostDetailResponse {
  post: PostDetalle;
}

/** Respuesta de votar un comentario: el nuevo total y el voto del usuario actual. */
export interface ComentarioVotoResponse {
  total: number;
  miVoto: number;
}

/** Usuario que dio puntos o recomendó un post (GET /api/posts/{id}/interacciones). */
export interface PostInteraccionUsuario {
  userName: string;
  avatar: string | null;
  /** Puntos dados (solo en votantes). */
  cantidad: number;
  fecha: string;
}

/** Mi estado sobre el post y quiénes interactuaron con él. */
export interface PostInteracciones {
  /** Puntos que le di (0 = todavía no voté). */
  misPuntos: number;
  enFavoritos: boolean;
  /** Ya lo recomendé (se recomienda una sola vez). */
  yoRecomende: boolean;
  /** Puntos que me quedan hoy; null sin sesión. */
  puntosDisponibles: number | null;
  /** Puntos que recibió hoy (resumen para el autor). */
  puntosHoy: number;
  votantes: PostInteraccionUsuario[];
  totalVotantes: number;
  recomendaron: PostInteraccionUsuario[];
  totalRecomendaciones: number;
}

/** Página de la lista completa (GET /api/posts/{id}/interacciones/{tipo}). */
export interface PostInteraccionesPagina {
  items: PostInteraccionUsuario[];
  total: number;
}

/** Evento en vivo "postVotado" del hub: puntos nuevos y quién votó. */
export interface PostVotadoEnVivo {
  postId: number;
  puntos: number;
  votante: PostInteraccionUsuario;
}

export interface FavoritoAlternado {
  activo: boolean;
  total: number;
}

/** GET api/posts/borradores: proyección propia del controlador (no es PostViewModel). */
export interface BorradorViewModel {
  id: number;
  titulo: string;
  fechaRegistro: string;
  fechaActualiza: string | null;
  puntos: number;
  categoria: { id: number; icono: string; nombre: string; seo: string };
  etiquetas: string;
  eliminado: boolean;
}

/** Fila del filtro por categoría de /borradores (`categorias` de PaginatedWithCategorias). */
export type CategoriaConteo = PaginatedWithCategorias<unknown>['categorias'][number];

/** Fila de los listados de la portada (GET api/posts y api/posts/sticky): proyección liviana del API. */
export interface PostListaViewModel {
  id: number;
  fechaRegistro: string;
  titulo: string;
  categoria: { icono: string; nombre: string; seo: string };
  sticky: boolean;
  /** No viene en api/posts/sticky. */
  esPrivado?: boolean;
  url: string;
  userName: string;
  avatar: string;
}


import { CategoriaViewModel } from '../parametros/parametros-vm.model';
import { UsuarioViewModel } from '../seguridad/seguridad-vm.model';

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

export interface FavoritosViewModel {
  id: number;
  fechaRegistro: string;
  post?: PostViewModel;
}

export interface PostSimpleViewModel {
  id: number;
  url: string;
  titulo: string;
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

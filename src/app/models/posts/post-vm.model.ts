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
  miVoto?: number;
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

/**
 * Respuesta de getPostById: el post viene envuelto en { post }. El API devuelve null si no existe (o es un borrador ajeno)
 * y, para un post privado sin sesión iniciada, solo { post: { esPrivado: true } }.
 */
export interface PostDetailResponse {
  post: PostViewModel;
}

/** Respuesta de votar un comentario: el nuevo total y el voto del usuario actual. */
export interface ComentarioVotoResponse {
  total: number;
  miVoto: number;
}

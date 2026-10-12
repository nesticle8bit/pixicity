/** Shout de un muro (ShoutViewModel del API). */
export interface ShoutViewModel {
  id: number;
  perfilId: number;
  usuarioId: number;
  comentario: string;
  url: string;
  tipo: string;
  mediaTitulo: string | null;
  mediaImagen: string | null;
  mediaDescripcion: string | null;
  /** Autor del shout. */
  avatar: { userName: string; avatar: string | null } | null;
  /** Dueño del muro donde se publicó (solo en el muro de /mi). */
  perfil?: { userName: string; avatar: string | null } | null;
  /** Contadores y lo que hizo el usuario actual (listas del perfil y de /mi). */
  interacciones?: ShoutInteracciones | null;
  fechaRegistro: string;
  /** Última edición del autor (null si nunca se editó). */
  fechaActualiza?: string | null;
}

/** Shout en el listado del panel admin (forma propia de GetShoutsAdmin). */
export interface ShoutAdmin {
  id: number;
  perfil: { userName: string; avatar: string | null };
  usuario: { userName: string; avatar: string | null };
  comentario: string;
  /** Enlace/media adjunto (YouTube, imagen...). */
  url: string | null;
  fechaRegistro: string;
  tipoString: string;
  eliminado: boolean;
}

export interface ShoutComentarioViewModel {
  id: number;
  shoutId: number;
  usuarioId: number;
  parentId: number | null;
  comentario: string;
  fechaRegistro: string;
  fechaActualiza: string | null;
  usuario: string;
  avatar: string | null;
  rango: { id: number; nombre: string; icono: string | null; color: string | null } | null;
  votos: number;
  miVoto: number;
  votosArriba: number;
  votosAbajo: number;
  fijado: boolean;
  denunciasPendientes: number;
}

/** Contadores de un shout y lo que hizo el usuario actual (false sin sesión). */
export interface ShoutInteracciones {
  meGustas: number;
  favoritos: number;
  meGusta: boolean;
  favorito: boolean;
  comentarios?: number;
  reshouts?: number;
  reshouteado?: boolean;
}

/** Respuesta de alternar un me gusta o favorito: total nuevo y si quedó marcado. */
export interface ShoutReaccion {
  total: number;
  activo: boolean;
}

export interface ShoutComentarioVoto {
  total: number;
  miVoto: number;
}

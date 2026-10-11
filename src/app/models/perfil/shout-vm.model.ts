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
  fechaRegistro: string;
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

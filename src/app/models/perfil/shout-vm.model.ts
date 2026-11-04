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
  /** +18: la media se ve difuminada hasta revelarla. */
  nsfw?: boolean;
  /** Fijado arriba del muro de su perfil por el autor (uno por perfil). */
  fijado?: boolean;
  /** El video (YouTube o archivo) se repite al terminar. */
  bucle?: boolean;
  /** Autor del shout. */
  avatar: { userName: string; avatar: string | null } | null;
  /** Dueño del muro donde se publicó (solo en el muro de /mi). */
  perfil?: { userName: string; avatar: string | null } | null;
  /** Contadores y lo que hizo el usuario actual (listas del perfil y de /mi). */
  interacciones?: ShoutInteracciones | null;
  /** Encuesta del shout (null/ausente si no tiene). */
  encuesta?: ShoutEncuesta | null;
  /** Solo al crear: textos de las opciones (2 a 4) y duración en minutos. */
  opcionesEncuesta?: string[];
  duracionEncuestaMinutos?: number;
  fechaRegistro: string;
  /** Última edición del autor (null si nunca se editó). */
  fechaActualiza?: string | null;
}

/** Encuesta de un shout (estilo Twitter): resultados y la opción que votó el usuario actual. */
export interface ShoutEncuesta {
  cierre: string;
  cerrada: boolean;
  totalVotos: number;
  miVoto: number | null;
  opciones: { id: number; texto: string; votos: number }[];
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
  /** Marcado +18: la media se muestra difuminada. */
  nsfw: boolean;
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
  /** "No me gusta": no resta karma; solo baja al shout en Más activos y en el TOP de la portada. */
  noMeGustas?: number;
  noMeGusta?: boolean;
  comentarios?: number;
  reshouts?: number;
  reshouteado?: boolean;
}

/** Respuesta de alternar un me gusta o favorito: total nuevo y si quedó marcado. */
export interface ShoutReaccion {
  total: number;
  activo: boolean;
  /** Me gusta y no me gusta: todas las cifras, porque marcar uno quita el otro. */
  interacciones?: ShoutInteracciones;
}

export interface ShoutComentarioVoto {
  total: number;
  miVoto: number;
}

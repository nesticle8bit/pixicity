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
  usuario: string;
  avatar: string | null;
  votos: number;
  miVoto: number;
  votosArriba: number;
  votosAbajo: number;
  fijado: boolean;
  denunciasPendientes: number;
}

export interface ShoutComentarioVoto {
  total: number;
  miVoto: number;
}

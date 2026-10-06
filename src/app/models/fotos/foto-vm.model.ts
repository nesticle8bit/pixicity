export interface FotoViewModel {
  id: number;
  categoriaId: number;
  usuarioId: number;
  titulo: string;
  descripcion: string;
  imageUrl: string;
  url: string;
  votosPositivos: number;
  votosNegativos: number;
  visitantes: number;
  fechaRegistro: string;
  usuario: string;
  avatar: string;
  categoria: string;
  miVoto?: number;
}

export interface FotoComentarioViewModel {
  id: number;
  fotoId: number;
  usuarioId: number;
  /** null en comentarios raíz; las respuestas cuelgan del raíz. */
  parentId: number | null;
  contenido: string;
  fechaComentario: string;
  fechaActualiza: string | null;
  votos: number;
  miVoto?: number | null;
  votosArriba: number;
  votosAbajo: number;
  fijado: boolean;
  denunciasPendientes: number;
  usuario: string;
  avatar: string | null;
  rango: { id: number; nombre: string; icono: string | null; color: string | null } | null;
}

export interface FotoComentarioVoto {
  total: number;
  miVoto: number;
}

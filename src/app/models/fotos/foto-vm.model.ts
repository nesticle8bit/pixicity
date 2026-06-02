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
}

export interface FotoComentarioViewModel {
  id: number;
  fotoId: number;
  usuarioId: number;
  contenido: string;
  fechaComentario: string;
  votos: number;
  miVoto?: number;
  usuario: string;
  avatar: string;
}

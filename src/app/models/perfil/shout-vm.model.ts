export interface ShoutViewModel {
  id: number;
  perfilId: number;
  usuarioId: number;
  comentario: string;
  url: string;
  tipo: string;
  fechaRegistro: string;
  usuario?: { userName: string; avatar: string };
  perfil?: { userName: string; avatar: string };
}

export interface ShoutComentarioViewModel {
  id: number;
  usuarioId: number;
  comentario: string;
  fechaRegistro: string;
  usuario: string;
  avatar: string;
}

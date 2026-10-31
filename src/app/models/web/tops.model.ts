import { PostViewModel } from '../posts/post-vm.model';

/** Fila de un ranking de /tops: `valor` es la métrica del ranking (miembros, votos, puntos...). */
export interface TopComunidad {
  id: number;
  nombre: string;
  nombreCorto: string;
  imagen: string;
  categoria: string;
  valor: number;
}

export interface TopTema {
  id: number;
  titulo: string;
  url: string;
  comunidadNombre: string;
  comunidadSlug: string;
  valor: number;
}

export interface TopUsuarioRanking {
  id: number;
  userName: string;
  avatar: string;
  valor: number;
}

export interface TopsComunidades {
  /** "Más populares": las de más miembros. */
  conMasMiembros: TopComunidad[];
  conMasTemas: TopComunidad[];
  conMasSeguidores: TopComunidad[];
}

export interface TopsTemas {
  conMasVotos: TopTema[];
  /** "Más respuestas". */
  conMasComentarios: TopTema[];
}

export interface TopsUsuarios {
  conMasPuntos: TopUsuarioRanking[];
  conMasSeguidores: TopUsuarioRanking[];
}

/** Respuesta de api/posts/top. */
export interface TopsPosts {
  postsConMasPuntos: PostViewModel[];
  postsConMasFavoritos: PostViewModel[];
  postsConMasComentarios: PostViewModel[];
  postsConMasSeguidores: PostViewModel[];
}

/** Pestaña "Inicio": el primer ranking de cada sección. */
export interface TopsResumen {
  posts: PostViewModel[];
  comunidades: TopComunidad[];
  temas: TopTema[];
  usuarios: TopUsuarioRanking[];
}

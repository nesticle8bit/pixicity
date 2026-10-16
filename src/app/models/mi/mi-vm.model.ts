import { ShoutViewModel } from '../perfil/shout-vm.model';

export type AlcanceMuro = 'siguiendo' | 'todos';

export interface MuroPost {
  id: number;
  titulo: string;
  url: string;
  puntos: number;
  comentarios: number;
  autor: { userName: string; avatar: string | null };
  categoriaNombre: string;
  categoriaIcono: string;
  categoriaSeo: string;
}

/** Entrada del muro de /mi: un shout, un shout compartido (reshout) o un post nuevo de alguien que sigues. */
export interface MuroItem {
  tipo: 'shout' | 'reshout' | 'post';
  fecha: string;
  shout: ShoutViewModel | null;
  compartidoPor: { userName: string; avatar: string | null } | null;
  post: MuroPost | null;
}

export interface Muro {
  items: MuroItem[];
  /** Cursor de la página siguiente (null: no hay más). */
  siguiente: string | null;
}

export interface MiResumen {
  id: number;
  userName: string;
  avatar: string | null;
  rango: string | null;
  puntos: number;
  seguidores: number;
  siguiendo: number;
  shouts: number;
  posts: number;
}

export interface Tendencia {
  /** Sin el "#". */
  tag: string;
  shouts: number;
  /** Último shout que lo usó. */
  ultimo: string;
}

export type OrdenTendencias = 'mejores' | 'recientes';

export interface SugerenciaUsuario {
  userName: string;
  avatar: string | null;
  seguidores: number;
}

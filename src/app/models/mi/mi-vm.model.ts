import { ShoutViewModel } from '../perfil/shout-vm.model';

/** 'nsfw': como Recientes pero solo shouts +18 (pide sesión, edad cargada y ser mayor). */
export type AlcanceMuro = 'siguiendo' | 'todos' | 'activos' | 'nsfw';

/** Ventana de "Más activos": shouts publicados en el último día, semana o mes. */
export type PeriodoActivos = 'dia' | 'semana' | 'mes';

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

/** Puesto del top de usuarios por shouts publicados en el período. */
export interface TopShoutero {
  userName: string;
  avatar: string | null;
  shouts: number;
  paisIso2: string | null;
  paisNombre: string | null;
}

import { PostViewModel } from '../posts/post-vm.model';
import { UsuarioViewModel } from '../seguridad/seguridad-vm.model';

export interface MonitorViewModel {
  id: number;
  fechaRegistro: string;
  leido: boolean;
  eliminado: boolean;
  mensaje: string;
  postId?: number;
  /** Comentario que originó el aviso: el enlace lleva a #comentario-{id}. */
  comentarioId?: number | null;
  /** Shout del aviso (me gusta, compartido, comentario o mención en un shout). */
  shoutId?: number | null;
  /** Autor del shout, para enlazar a /shouts/{autor}/{id}. */
  shoutAutor?: string | null;
  tipoString: string;
  // null en avisos del sistema (p. ej. moderación).
  usuarioQueHaceAccion: UsuarioViewModel | null;
  post: PostViewModel;
}

/** Filtros de /monitor. Tipos = nombres de TipoMonitor; vacío = todos. */
export interface FiltroNotificaciones {
  tipos?: string[];
  q?: string;
  soloNoLeidas?: boolean;
  periodo?: '' | 'hoy' | 'semana' | 'mes';
}

export interface StatsViewModel {
  notifications: number;
  messages: number;
}

export interface ActividadViewModel {
  id: number;
  fechaRegistro: string;
  tipoString: string;
  mensaje: string;
  userName: string;
  avatar: string;
}

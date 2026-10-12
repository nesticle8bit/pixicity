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

/** Una línea de "Última actividad" del perfil. Todo son datos: se pintan con interpolación, nunca con innerHTML. */
export interface ActividadViewModel {
  id: number;
  fechaRegistro: string;
  tipoActividad: number;
  accion: string;
  /** Puntos o voto (+/-), si aplica. */
  detalle?: string | null;
  /** Título del post o nombre del usuario; null si ya no existe. */
  titulo?: string | null;
  url?: string | null;
  /** Avatar del usuario seguido. */
  avatar?: string | null;
}

/** Respuesta de /api/usuarios/getActividadUsuario: actividad agrupada por antigüedad. */
export interface ActividadLogsViewModel {
  hoy: ActividadViewModel[];
  ayer: ActividadViewModel[];
  semana: ActividadViewModel[];
  mes: ActividadViewModel[];
}

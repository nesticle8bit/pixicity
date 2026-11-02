import { UsuarioAvatarViewModel } from '../seguridad/seguridad-vm.model';

export interface MensajeViewModel {
  id: number;
  fechaRegistro: string;
  asunto: string;
  contenido: string;
  leido: boolean;
  /** Cuándo lo leyó el destinatario. */
  fechaLeido?: string | null;
  /** URLs de imágenes adjuntas, una por línea (como las guarda el API). */
  imagenes?: string | null;
  eliminado: boolean;
  esMio?: boolean;
  /** Mensaje al que responde y su resumen (puede ser más viejo que la página cargada). */
  respuestaAId?: number | null;
  cita?: MensajeCita | null;
  usuarioDe: UsuarioAvatarViewModel;
  usuarioA: UsuarioAvatarViewModel;
}

/** Lo que se ve del mensaje citado en la burbuja y en la barra "Respondiendo a…". */
export interface MensajeCita {
  id: number;
  userName: string;
  esMio: boolean;
  /** Texto plano recortado. */
  texto?: string | null;
  imagen?: string | null;
  /** Lo borré (o se eliminó): solo "Mensaje eliminado". */
  eliminado?: boolean;
}

export interface ConversacionViewModel {
  ultimoMensajeId: number;
  fechaRegistro: string;
  asunto: string;
  contenido: string;
  esMio: boolean;
  leido: boolean;
  noLeidos: number;
  /** Cuándo leyó el otro mi último mensaje (solo si es mío). */
  fechaLeido?: string | null;
  cantidadImagenes?: number;
  archivada?: boolean;
  silenciada?: boolean;
  otro: UsuarioAvatarViewModel;
}

/** Bandeja: conversaciones de la carpeta pedida y cuántas hay archivadas (para la pestaña). */
export interface BandejaConversaciones {
  conversaciones: ConversacionViewModel[];
  archivadas: number;
  pagination: import('../api/api-response.model').Pagination;
}

/** Fila de la bandeja: la conversación más la marca de selección local. */
export type ConversacionFila = ConversacionViewModel & { selected: boolean };

export interface ConversacionPage {
  mensajes: MensajeViewModel[];
  hayMas: boolean;
  bloqueado: boolean;
  archivada?: boolean;
  silenciada?: boolean;
  otro: UsuarioAvatarViewModel;
}

export interface ConversacionParams {
  id?: number;
  userName?: string;
  antesDeId?: number;
  take?: number;
}

export interface SendMPViewModel {
  aUserName: string;
  asunto: string;
  contenido: string;
  /** URLs devueltas por subirImagenMensaje (máximo 4). */
  imagenes?: string[];
  /** Mensaje de la conversación al que responde. */
  respuestaAId?: number;
}

export interface ResponseMPViewModel {
  type: string;
  message: string;
}

/** Eventos que envía el NotificationHub (ver INotificationPusher en el API). */

/** Notificación personal (campana). Sale de LogsService.SaveMonitor. */
export interface NotificacionEnVivo {
  id: number;
  mensaje: string;
  tipo: string;
  fechaRegistro: string;
  postId: number | null;
}

/** Reporte nuevo para el staff. Sale de ModeracionService.Reportar. */
export interface ReporteEnVivo {
  tipoContenido: number;
  tipoContenidoNombre: string;
  contenidoId: number;
  motivo: string;
  reporta: string;
}

/** Actividad pública para la página "En Vivo". Sale de ActividadService.PushEnVivo. */
export interface ActividadEnVivo {
  usuario: string;
  /** Archivo del avatar (o null): la URL la arma app-user-avatar con environment.api. */
  avatar: string | null;
  usuarioUrl: string;
  accion: string;
  titulo: string;
  tituloUrl: string;
  tipo: string;
  fecha: string;
}

/** Mensaje privado nuevo (recibido, o enviado desde otra pestaña). */
export interface MensajeEnVivo {
  id: number;
  otroId: number;
  esMio: boolean;
  /** El destinatario silenció la conversación: sin aviso ni sonido. */
  silenciada?: boolean;
}

/** El otro usuario leyó mis mensajes. */
export interface EventoDeUsuario {
  porId: number;
  /** En "mensajesLeidos": cuándo los leyó. */
  fecha?: string;
}

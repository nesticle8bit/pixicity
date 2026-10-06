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
  avatar: string;
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
}

/** El otro usuario leyó mis mensajes, o me está escribiendo. */
export interface EventoDeUsuario {
  porId: number;
}

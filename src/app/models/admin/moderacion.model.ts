import { PaginatedData } from '../api/api-response.model';

/** Reporte de contenido (ReporteViewModel del API). */
export interface Reporte {
  id: number;
  tipoContenido: number;
  tipoContenidoNombre: string;
  contenidoId: number;
  motivo: string;
  resuelto: boolean;
  resueltoPor: string | null;
  fechaResuelto: string | null;
  fechaRegistro: string;
  reportanteUserName: string | null;
  reportanteAvatar: string | null;
  /** Peso del reporte: más de 1 si lo hizo un usuario de confianza. */
  peso?: number;
  deConfianza?: boolean;
  /** Suma de los pesos de los reportes pendientes del mismo contenido (prioridad en la cola). */
  pesoTotal?: number;
  contenidoPreview: string | null;
  /** Para banear al autor desde la cola. */
  autorId?: number | null;
  autorUserName: string | null;
  autorAvatar: string | null;
  contenidoEliminado: boolean;
  contextoUrl: string | null;
}

/** Página de reportes: además trae el total de pendientes (para el contador del panel). */
/** Acciones de la barra de selección múltiple de la cola. */
export type AccionLote = 'resolver' | 'descartar' | 'ocultar';

export type PaginaReportes = PaginatedData<Reporte> & { pendientes: number };

/** Acción de staff registrada en la bitácora (ModeracionLogViewModel del API). */
export interface ModeracionLog {
  id: number;
  accion: number;
  accionNombre: string;
  staffUserName: string | null;
  tipoContenido: number | null;
  contenidoId: number | null;
  /** Qué cambió, en palabras. */
  detalle: string | null;
  /** Lo moderado (título del post, usuario, extracto del shout) y su enlace, tal como estaban en ese momento. */
  objetivo: string | null;
  objetivoUrl: string | null;
  /** Causa que escribió el moderador. */
  razon: string | null;
  fechaRegistro: string;
}

/** Regla del protocolo que se cita al eliminar contenido (GET /api/moderacion/reglas). */
export interface ReglaProtocolo {
  id: string;
  titulo: string;
  descripcion: string;
}

/** Denuncias del panel de moderación de una comunidad. */
export interface ReportesComunidad {
  reportes: Reporte[];
  pendientes: number;
}

/** Filtros de /mod-history. */
export interface FiltroHistorial {
  accion?: number | null;
  moderador?: string | null;
}

/** Acción que se puede filtrar en el historial. */
export interface AccionModeracion {
  id: number;
  nombre: string;
}

/** Estado de una apelación (EstadoApelacion del API). */
export enum EstadoApelacion {
  Pendiente = 0,
  Aceptada = 1,
  Rechazada = 2,
}

/** Apelación de una acción de moderación (ApelacionViewModel). */
export interface Apelacion {
  id: number;
  moderacionLogId: number | null;
  userName: string | null;
  mensaje: string;
  estado: EstadoApelacion;
  estadoNombre: string;
  respuesta: string | null;
  atendidaPor: string | null;
  fechaAtendida: string | null;
  fechaRegistro: string;
  accionNombre?: string | null;
  objetivo?: string | null;
  objetivoUrl?: string | null;
  detalle?: string | null;
  razon?: string | null;
  moderador?: string | null;
}

/** Una acción de moderación sobre el usuario actual (GET api/apelaciones/me). */
export interface MiModeracion {
  moderacionLogId: number;
  accion: number;
  accionNombre: string;
  objetivo: string | null;
  detalle: string | null;
  razon: string | null;
  fechaRegistro: string;
  apelable: boolean;
  apelacion: Apelacion | null;
}

export type PaginaApelaciones = PaginatedData<Apelacion> & { pendientes: number };

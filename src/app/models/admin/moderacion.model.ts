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
  contenidoPreview: string | null;
  autorUserName: string | null;
  autorAvatar: string | null;
  contenidoEliminado: boolean;
  contextoUrl: string | null;
}

/** Página de reportes: además trae el total de pendientes (para el contador del panel). */
export type PaginaReportes = PaginatedData<Reporte> & { pendientes: number };

/** Acción de staff registrada en la bitácora (ModeracionLogViewModel del API). */
export interface ModeracionLog {
  id: number;
  accion: number;
  accionNombre: string;
  staffUserName: string | null;
  tipoContenido: number | null;
  contenidoId: number | null;
  detalle: string | null;
  fechaRegistro: string;
}

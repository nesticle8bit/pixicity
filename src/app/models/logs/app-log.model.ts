export type AppLogNivel = 'Warning' | 'Error' | 'Critical';
export type AppLogOrigen = 'api' | 'frontend';

export interface AppLog {
  id: number;
  fecha: string;
  nivel: AppLogNivel;
  origen: AppLogOrigen;
  categoria: string | null;
  mensaje: string;
  excepcion: string | null;
  stackTrace: string | null;
  metodo: string | null;
  ruta: string | null;
  statusCode: number | null;
  userName: string | null;
  ip: string | null;
  userAgent: string | null;
  traceId: string | null;
  huella: string | null;
  resuelto: boolean;
  fechaResuelto: string | null;
  usuarioResuelve: string | null;
}

export interface AppLogFiltro {
  nivel?: AppLogNivel | '';
  origen?: AppLogOrigen | '';
  texto?: string;
  soloPendientes: boolean;
}

export interface AppLogGrupo {
  huella: string;
  nivel: AppLogNivel | null;
  origen: AppLogOrigen | null;
  mensaje: string | null;
  cantidad: number;
  ultima: string;
  ultimoId: number;
}

export interface AppLogResumen {
  pendientes: number;
  ultimas24h: number;
  errores24h: number;
  frontend24h: number;
  masFrecuentes: AppLogGrupo[];
}

export interface DashboardMetrica {
  total: number;
  ultimos7: number;
  previos7: number;
  /** Variación % de los últimos 7 días contra los 7 previos. null = sin base de comparación. */
  variacion: number | null;
}

export interface DashboardSerieDia {
  fecha: string;
  posts: number;
  comentarios: number;
  usuarios: number;
}

export interface DashboardPendiente {
  clave: string;
  titulo: string;
  icono: string;
  ruta: string;
  cantidad: number;
  /** Horas que lleva esperando el pendiente más viejo del grupo. */
  esperaHoras: number | null;
}

export interface DashboardUsuario {
  id: number;
  userName: string;
  avatar: string;
  puntos: number;
  rango: string | null;
  rangoColor: string | null;
  fechaRegistro: string;
}

export interface DashboardPost {
  id: number;
  titulo: string;
  url: string;
  userName: string;
  avatar: string;
  categoria: string;
  categoriaSeo: string;
  puntos: number;
  comentarios: number;
  visitas: number;
  fechaRegistro: string;
}

export interface DashboardActividad {
  id: number;
  accion: number;
  accionNombre: string;
  staff: string;
  staffAvatar: string | null;
  detalle: string;
  fechaRegistro: string;
}

export interface DashboardResumen {
  usuarios: DashboardMetrica;
  posts: DashboardMetrica;
  comentarios: DashboardMetrica;
  shouts: DashboardMetrica;

  onlineTotal: number;
  onlineRegistrados: number;
  onlineInvitados: number;
  recordOnline: number;

  usuariosBaneados: number;
  totalPendientes: number;

  pendientes: DashboardPendiente[];
  serie: DashboardSerieDia[];
  ultimosUsuarios: DashboardUsuario[];
  ultimosPosts: DashboardPost[];
  topPostsSemana: DashboardPost[];
  actividad: DashboardActividad[];
}

/** Rendimiento de un endpoint del API (ver RequestMetrics en el backend). */
export interface MetricaRuta {
  ruta: string;
  peticiones: number;
  errores: number;
  promedioMs: number;
  p95Ms: number;
  maxMs: number;
}

/** GET /api/dashboard/getMetricas: métricas en memoria desde el último reinicio del API. */
export interface MetricasApi {
  minutos: number;
  peticiones: number;
  peticionesPorMinuto: number;
  errores: number;
  tasaError: number;
  p50Ms: number;
  p95Ms: number;
  masLentas: MetricaRuta[];
  conErrores: MetricaRuta[];
  masUsadas: MetricaRuta[];
}

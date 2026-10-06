/**
 * Formas de las respuestas de /api/comunidades (ver ComunidadesController). Las fechas llegan como texto ISO en UTC.
 */

// ---------------------------------------------------------------- taxonomía

export interface ComunidadSubCategoria {
  id: number;
  nombre: string;
  orden: number;
}

export interface ComunidadCategoria {
  id: number;
  nombre: string;
  seo: string;
  orden: number;
  subCategorias: ComunidadSubCategoria[];
}

export interface ComunidadCategoriaGuardar {
  id?: number;
  nombre: string;
  seo?: string;
  orden: number;
}

export interface ComunidadSubCategoriaGuardar {
  id?: number;
  comunidadCategoriaId: number;
  nombre: string;
  orden: number;
}

// ---------------------------------------------------------------- comunidades

/** Tarjeta de comunidad en listados y en "top comunidades". */
export interface ComunidadCard {
  id: number;
  nombre: string;
  nombreCorto: string;
  descripcion: string | null;
  imagen: string | null;
  categoria: string | null;
  creador: string | null;
  miembrosCount: number;
  temasCount: number;
  fechaRegistro: string;
}

export interface ComunidadDetalle {
  id: number;
  nombre: string;
  nombreCorto: string;
  descripcion: string | null;
  imagen: string | null;
  /** ComunidadAccesoEnum: quién puede ver la comunidad. */
  acceso: number;
  /** Permiso por defecto de los miembros nuevos. */
  permisos: number;
  fechaRegistro: string;
  creador: string | null;
  creadorAvatar: string | null;
  categoria: { id: number; nombre: string; seo: string } | null;
  subCategoria: { id: number; nombre: string } | null;
  pais: { nombre: string; iso2: string } | null;
  paisId: number | null;
  miembrosCount: number;
  temasCount: number;
  seguidoresCount: number;
  soyMiembro: boolean;
  laSigo: boolean;
}

export interface ComunidadGuardar {
  id?: number;
  nombre: string;
  nombreCorto: string;
  descripcion?: string | null;
  imagen?: string | null;
  comunidadCategoriaId: number;
  comunidadSubCategoriaId?: number | null;
  paisId?: number | null;
  acceso: number;
  permisos: number;
}

export interface ComunidadMiembro {
  id: number;
  usuarioId: number;
  permiso: number;
  esStaff: boolean;
  userName: string | null;
  avatar: string | null;
  fechaRegistro: string;
}

export interface ComunidadesEstadisticas {
  totalComunidades: number;
  totalTemas: number;
  totalMiembros: number;
  totalComentarios: number;
}

// ---------------------------------------------------------------- temas

export interface TemaListado {
  id: number;
  titulo: string;
  url: string;
  visitantes: number;
  sticky: boolean;
  fechaRegistro: string;
  userName: string | null;
  avatar: string | null;
}

export interface TemaRango {
  nombre: string;
  color: string | null;
  icono: string | null;
}

export interface TemaComentario {
  id: number;
  parentId: number | null;
  contenido: string;
  fechaComentario: string;
  fechaActualiza: string | null;
  votos: number;
  /** -1, 0 o 1. */
  miVoto: number;
  votosArriba: number;
  votosAbajo: number;
  denunciasPendientes: number;
  fijado: boolean;
  userName: string | null;
  avatar: string | null;
  rango: TemaRango | null;
}

export interface TemaDelUsuario {
  id: number;
  titulo: string;
  url: string;
  visitantes: number;
  fechaRegistro: string;
  comunidadSlug: string | null;
}

export interface TemaDetalle {
  id: number;
  titulo: string;
  contenido: string;
  url: string;
  visitantes: number;
  sticky: boolean;
  fechaRegistro: string;
  comunidadId: number;
  votos: number;
  miVoto: number;
  comunidad: { nombre: string; nombreCorto: string; usuarioId: number } | null;
  userName: string | null;
  avatar: string | null;
  temasUsuario: TemaDelUsuario[];
  comentarios: TemaComentario[];
}

export interface TemaGuardar {
  id?: number;
  comunidadId: number;
  titulo: string;
  contenido: string;
}

export interface TemaComentarioGuardar {
  comunidadTemaId: number;
  parentId?: number | null;
  contenido: string;
}

export interface ResultadoVoto {
  total: number;
  miVoto: number;
}

// ---------------------------------------------------------------- widgets

export interface TemaTop {
  id: number;
  titulo: string;
  url: string;
  visitantes: number;
  userName: string | null;
}

export interface TemaTopGlobal {
  id: number;
  titulo: string;
  url: string;
  visitantes: number;
  comunidadNombre: string | null;
  comunidadSlug: string | null;
}

export interface TemaReciente {
  id: number;
  titulo: string;
  url: string;
  visitantes: number;
  fechaRegistro: string;
  userName: string | null;
  avatar: string | null;
  comunidadNombre: string | null;
  comunidadSlug: string | null;
}

export interface ComentarioReciente {
  id: number;
  contenido: string;
  fechaComentario: string;
  userName: string | null;
  avatar: string | null;
  temaId: number;
  temaTitulo: string | null;
  temaUrl: string | null;
  /** Solo en el listado global. */
  comunidadSlug?: string | null;
}

// ---------------------------------------------------------------- filtros

export interface BusquedaPaginada {
  page?: number;
  pageCount?: number;
  query?: string;
}

export interface BusquedaComunidades extends BusquedaPaginada {
  categoriaId?: number | string | null;
}

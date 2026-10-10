/**
 * Filas de las tablas del panel admin, tal como las serializa el API. Varios endpoints de admin devuelven la entidad
 * completa (con los campos de PixicityBase), no el ViewModel público, así que llevan tipos propios.
 */

/** Campos comunes de toda entidad (PixicityBase en el API). */
export interface EntidadBase {
  id: number;
  eliminado: boolean;
  usuarioRegistra: string;
  fechaRegistro: string;
  usuarioActualiza: string;
  fechaActualiza: string | null;
  usuarioElimina: string;
  fechaElimina: string | null;
}

export interface AfiliadoAdmin extends EntidadBase {
  codigo: string;
  titulo: string;
  url: string;
  banner: string;
  descripcion: string;
  hitsIn: number;
  hitsOut: number;
  activo: boolean;
}

export interface CategoriaAdmin extends EntidadBase {
  nombre: string;
  seo: string;
  icono: string;
  discordChannelId: string | null;
}

export interface ContactoAdmin extends EntidadBase {
  nombre: string;
  email: string;
  medio: string;
  comentarios: string;
  gestionado: boolean;
}

export interface NoticiaAdmin extends EntidadBase {
  orden: number;
  contenido: string;
}

export interface PaginaAdmin extends EntidadBase {
  titulo: string;
  slug: string;
  contenido: string;
  tipo: string;
  target: string;
}

export interface PaisAdmin extends EntidadBase {
  nombre: string;
  iso2: string;
  iso3: string;
}

/** Proyección de FotosController.GetFotosAdmin. */
export interface FotoAdmin {
  id: number;
  titulo: string;
  fechaRegistro: string;
  imageUrl: string;
  url: string;
  votosPositivos: number;
  votosNegativos: number;
  visitantes: number;
  eliminado: boolean;
  ip: string;
  categoria: string | null;
  userName: string;
}

/** Proyección de PostsController.GetPostsAdmin. */
export interface PostAdmin {
  id: number;
  titulo: string;
  url: string;
  fechaRegistro: string;
  puntos: number;
  categoria: { icono: string; nombre: string; seo: string };
  etiquetas: string;
  sticky: boolean;
  esPrivado: boolean;
  eliminado: boolean;
  userName: string;
  ip: string;
}

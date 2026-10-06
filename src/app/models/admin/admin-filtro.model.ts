import { HttpParams } from '@angular/common/http';

/** Filtros comunes de las tablas del panel (AdminFiltro del API). Todos opcionales. */
export interface AdminFiltro {
  q?: string;
  /** yyyy-MM-dd, inclusive. */
  desde?: string;
  /** yyyy-MM-dd, inclusive. */
  hasta?: string;
  estado?: '' | 'activos' | 'eliminados';
  usuario?: string;
  orden?: '' | 'recientes' | 'antiguos';
  categoriaId?: number | null;
  /** Filtro propio de cada tabla (ver AdminFiltrosConfig.tipos). */
  tipo?: string;
}

/** Qué controles avanzados muestra <app-admin-filtros> en cada tabla. */
export interface AdminFiltrosConfig {
  placeholder?: string;
  fechas?: boolean;
  estado?: boolean;
  orden?: boolean;
  /** Etiqueta del campo usuario (p. ej. "Autor", "Remitente"); sin ella no se muestra. */
  usuario?: string;
  categorias?: { id: number; nombre: string }[];
  /** Opciones del filtro propio de la tabla. */
  tipos?: { valor: string; label: string }[];
  tipoLabel?: string;
}

/** Cantidad de filtros avanzados activos (para el contador del botón "Filtros"). */
export function contarFiltrosAvanzados(f: AdminFiltro): number {
  return [f.desde, f.hasta, f.estado, f.usuario?.trim(), f.orden === 'antiguos' ? 'x' : '', f.categoriaId, f.tipo].filter(
    (v) => v !== undefined && v !== null && v !== ''
  ).length;
}

/**
 * Parámetros HTTP del filtro (solo los que tienen valor). Con `paginacion` agrega también page/pageCount, para los
 * endpoints cuya URL no los trae.
 */
export function adminParams(filtro: AdminFiltro = {}, paginacion?: { page: number; pageCount: number }): HttpParams {
  let p = new HttpParams();
  if (paginacion) p = p.set('page', paginacion.page).set('pageCount', paginacion.pageCount);
  if (filtro.q?.trim()) p = p.set('q', filtro.q.trim());
  if (filtro.desde) p = p.set('desde', filtro.desde);
  if (filtro.hasta) p = p.set('hasta', filtro.hasta);
  if (filtro.estado) p = p.set('estado', filtro.estado);
  if (filtro.usuario?.trim()) p = p.set('usuario', filtro.usuario.trim());
  if (filtro.orden) p = p.set('orden', filtro.orden);
  if (filtro.categoriaId) p = p.set('categoriaId', filtro.categoriaId);
  if (filtro.tipo) p = p.set('tipo', filtro.tipo);
  return p;
}

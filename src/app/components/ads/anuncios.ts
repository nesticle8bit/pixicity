/**
 * Espacios de publicidad del sitio. La lista de ids es la misma que AnunciosCatalogo.Ubicaciones del API, que es
 * quien valida lo que guarda el admin (los nombres que ve el admin también vienen del API).
 */
export const UBICACIONES_ANUNCIO = [
  'portada-lateral',
  'post-arriba',
  'post-medio',
  'post-abajo',
  'post-lateral',
  'comunidad-lateral',
  'tema-arriba',
  'tema-abajo',
  'foto-lateral',
  'fotos-listado',
  'perfil-lateral',
  'paginas-lateral',
] as const;
export type UbicacionAnuncio = (typeof UBICACIONES_ANUNCIO)[number];

/** Componentes propios que se pueden poner en un espacio de publicidad. */
export const COMPONENTES_ANUNCIO = [{ id: 'discord', nombre: 'Discord' }] as const;
export type ComponenteAnuncio = (typeof COMPONENTES_ANUNCIO)[number]['id'];
export type VarianteAnuncio = 'cuadrado' | 'horizontal';

export type TipoAnuncio = 'html' | 'imagen' | 'componente';
export type DispositivoAnuncio = 'todos' | 'movil' | 'escritorio';
export type AudienciaAnuncio = 'todos' | 'anonimos' | 'registrados';

/** Anuncio vigente tal como lo manda GET /api/anuncios (con su segmentación). */
export interface AnuncioPublico {
  id: number;
  tipo: TipoAnuncio;
  html?: string | null;
  imagenUrl?: string | null;
  enlaceUrl?: string | null;
  textoAlternativo?: string | null;
  ancho?: number | null;
  alto?: number | null;
  componente?: ComponenteAnuncio | null;
  variante?: VarianteAnuncio | null;
  ubicaciones: string[];
  categoriaIds: number[];
  categoriaSeos: string[];
  comunidadIds: number[];
  dispositivo: DispositivoAnuncio;
  audiencia: AudienciaAnuncio;
  peso: number;
}

/** Lo que se sabe de la página donde está el espacio. */
export interface ContextoAnuncio {
  categoriaId?: number | null;
  categoriaSeo?: string | null;
  comunidadId?: number | null;
}

export interface Visitante {
  movil: boolean;
  conSesion: boolean;
}

/**
 * ¿Puede salir este anuncio aquí? Sin categorías ni comunidades elegidas sale en todas partes; con alguna, solo
 * en las páginas de esa categoría o comunidad (en una página sin categoría, como un perfil, no sale).
 */
export function anuncioAplica(a: AnuncioPublico, ubicacion: string, contexto: ContextoAnuncio, visitante: Visitante): boolean {
  if (!a.ubicaciones.includes(ubicacion)) return false;
  if (a.dispositivo === 'movil' && !visitante.movil) return false;
  if (a.dispositivo === 'escritorio' && visitante.movil) return false;
  if (a.audiencia === 'anonimos' && visitante.conSesion) return false;
  if (a.audiencia === 'registrados' && !visitante.conSesion) return false;

  if (a.categoriaIds.length) {
    const porId = contexto.categoriaId != null && a.categoriaIds.includes(contexto.categoriaId);
    const porSeo = !!contexto.categoriaSeo && a.categoriaSeos.includes(contexto.categoriaSeo);
    if (!porId && !porSeo) return false;
  }
  if (a.comunidadIds.length && (contexto.comunidadId == null || !a.comunidadIds.includes(contexto.comunidadId))) {
    return false;
  }
  return true;
}

/** Después de qué párrafo va el anuncio "post-medio". */
export const PARRAFOS_ANTES_DEL_MEDIO = 3;

/**
 * Parte el HTML de un post después de su párrafo número `n` (contando solo los del primer nivel, no los que están
 * dentro de una tabla o una cita). Si después no quedan al menos dos bloques, no lo parte: el anuncio quedaría
 * pegado al final, donde ya está "post-abajo". Solo en el navegador (usa DOMParser; los anuncios no van en el SSR).
 */
export function partirContenido(html: string | null | undefined, n = PARRAFOS_ANTES_DEL_MEDIO): [string, string] | null {
  if (!html || typeof DOMParser === 'undefined') return null;

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const nodos = Array.from(doc.body.childNodes);
  let parrafos = 0;
  const corte = nodos.findIndex((nodo) => nodo.nodeName === 'P' && ++parrafos === n);
  if (corte < 0 || nodos.slice(corte + 1).filter((nodo) => nodo.nodeType === Node.ELEMENT_NODE).length < 2) return null;

  const antes = doc.createElement('div');
  const despues = doc.createElement('div');
  nodos.forEach((nodo, i) => (i <= corte ? antes : despues).appendChild(nodo));
  return [antes.innerHTML, despues.innerHTML];
}

/** Uno al azar según el peso: con peso 2 sale el doble de veces que con peso 1. */
export function elegirPorPeso(candidatos: AnuncioPublico[], azar: () => number = Math.random): AnuncioPublico | null {
  const total = candidatos.reduce((s, a) => s + Math.max(1, a.peso), 0);
  let punto = azar() * total;
  for (const a of candidatos) {
    punto -= Math.max(1, a.peso);
    if (punto < 0) return a;
  }
  return candidatos.at(-1) ?? null;
}

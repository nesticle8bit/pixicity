/** Edad mínima para el contenido NSFW (la misma que SeguridadService.EdadNsfw del API). */
export const EDAD_NSFW = 18;

/** Edad a partir de la fecha "d/m/aaaa" del perfil; null si no la cargó o no se entiende. */
export function edadDesde(fechaNacimiento: string | null | undefined, hoy = new Date()): number | null {
  const [d, m, a] = (fechaNacimiento ?? '').split('/').map(Number);
  if (!d || !m || !a) return null;
  let edad = hoy.getFullYear() - a;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad--;
  return edad;
}

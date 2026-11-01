/**
 * Avatar por defecto de quien no subió foto: la inicial del usuario sobre un color. El color sale del nombre (no al
 * azar en cada carga), así cada usuario se ve siempre igual en todo el sitio.
 *
 * Es un SVG en data URI para usarlo como `src` del mismo <img>: los estilos que la app pone a los avatares (tamaño,
 * bordes, círculo) siguen aplicando sin cambios.
 */

/** Todos con contraste de al menos 4.5:1 contra la letra blanca. */
export const COLORES_AVATAR = [
  '#1565c0', '#6a1b9a', '#ad1457', '#c62828', '#2e7d32', '#00695c',
  '#4527a0', '#b23c00', '#5d4037', '#37474f', '#0277bd', '#8e24aa',
] as const;

/** Sin usuario (anónimo o dato faltante). */
const COLOR_NEUTRO = '#78858f';

/** Primera letra o número del nombre, en mayúscula ("_juan" → "J"); "?" si no hay ninguno. */
export function inicialDe(userName: string | null | undefined): string {
  const letra = [...(userName ?? '')].find((c) => /[\p{L}\p{N}]/u.test(c));
  return letra ? letra.toLocaleUpperCase('es') : '?';
}

/** Color fijo para cada nombre (sin distinguir mayúsculas). */
export function colorDe(userName: string | null | undefined): string {
  const nombre = (userName ?? '').trim().toLowerCase();
  if (!nombre) return COLOR_NEUTRO;
  // FNV-1a de 32 bits: barato y reparte bien nombres parecidos ("juan1", "juan2").
  let hash = 0x811c9dc5;
  for (let i = 0; i < nombre.length; i++) {
    hash ^= nombre.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return COLORES_AVATAR[(hash >>> 0) % COLORES_AVATAR.length];
}

/** Data URI del avatar con la inicial. Se escala a cualquier tamaño (viewBox de 100). */
export function avatarInicial(userName: string | null | undefined): string {
  const inicial = inicialDe(userName).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" fill="${colorDe(userName)}"/>` +
    `<text x="50" y="50" dy=".35em" text-anchor="middle" fill="#fff" font-size="50" font-weight="700" ` +
    `font-family="Lato,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">${inicial}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

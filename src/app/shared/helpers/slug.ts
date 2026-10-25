/** Mismo tope que SlugHelper.Largo del API. */
const LARGO = 80;
const SIN_TITULO = 'sin-titulo';

/**
 * Slug de posts, temas y fotos a partir del título: tiene que dar lo mismo que SlugHelper.Titulo del API, que es
 * quien arma el canonical. Si no coinciden la página igual carga (se busca por id), pero redirige a la del API.
 * Sin tildes en las letras latinas (en otros alfabetos la marca cambia la letra), solo letras y dígitos separados
 * por un guion, cortado en un guion antes de LARGO caracteres.
 */
export function slugTitulo(titulo: string | null | undefined): string {
  if (!titulo?.trim()) return '';

  let slug = titulo
    .normalize('NFD')
    .replace(/([\u0000-ɏ])\p{Mn}+/gu, '$1')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{Nd}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length > LARGO) {
    const corte = slug.lastIndexOf('-', LARGO);
    slug = slug.slice(0, corte > LARGO / 2 ? corte : LARGO).replace(/^-+|-+$/g, '');
  }

  return slug || SIN_TITULO;
}

/**
 * URLs de imagen escritas dentro de un texto (p. ej. un mensaje privado con "mira https://i.imgur.com/abc.png").
 * Solo enlaces http(s) que terminan en una extensión de imagen; el texto puede ser HTML (saltos de línea como <br>,
 * enlaces <a href>), así que se toma la URL tal cual aparece y se decodifica &amp;.
 */
// La puntuación final ("…x.png." o "…x.png?") cierra la URL solo si después viene un espacio, una etiqueta o el fin.
const URL_IMAGEN =
  /https?:\/\/[^\s"'<>]+?\.(?:jpe?g|png|gif|webp|avif)(?:\?[^\s"'<>]*[^\s"'<>.,!?;:)])?(?=$|[\s"'<>)]|[.,!?;:](?=$|[\s"'<>)]))/gi;

/** Hasta `maximo` URLs distintas, en el orden en que aparecen. */
export function imagenesEnTexto(texto: string | null | undefined, maximo = 4): string[] {
  if (!texto) return [];
  const vistas = new Set<string>();
  for (const coincidencia of texto.matchAll(URL_IMAGEN)) {
    vistas.add(coincidencia[0].replace(/&amp;/g, '&'));
    if (vistas.size >= maximo) break;
  }
  return [...vistas];
}

/** El texto no tiene nada más que esas URLs (ni palabras ni emotes): se puede mostrar solo la imagen. */
export function soloUrlsDeImagen(texto: string | null | undefined, urls: string[]): boolean {
  if (!texto || urls.length === 0) return false;
  let resto = texto.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1').replace(/<br\s*\/?>/gi, ' ').replace(/&amp;/g, '&');
  for (const url of urls) resto = resto.split(url).join(' ');
  return resto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() === '';
}

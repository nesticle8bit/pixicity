/**
 * HTML básico en comentarios y shouts. El API ya guarda el texto saneado (HtmlSanitizer), pero aquí no se confía en
 * eso: todo se escapa y después solo vuelven a ser etiquetas las de formato de esta lista, siempre sin atributos, y los
 * <a href="https://..."> (se rearman con target y rel propios; cualquier otro atributo deja el enlace como texto).
 */

const ENTIDADES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

/** El sanitizador del API codifica "&", "<"... al guardar; se deshace una vez para no mostrar "&amp;". */
export function decodificarEntidades(texto: string): string {
  return texto.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_m, e: string) => ENTIDADES[e]);
}

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Etiquetas de formato en línea que se permiten (sin atributos). */
export const ETIQUETAS_BASICAS = ['b', 'strong', 'i', 'em', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'code', 'kbd', 'br'];

const ETIQUETA_ESCAPADA = new RegExp(`&lt;(\\/?)(${ETIQUETAS_BASICAS.join('|')})\\s*\\/?&gt;`, 'gi');

/** <a href="https://...">texto</a> ya escapado. La URL no puede tener comillas, espacios ni < >. */
export const ENLACE_HTML_ESCAPADO =
  /&lt;a\s+href=&quot;(https?:\/\/(?:(?!&quot;)[^\s<>])+)&quot;\s*&gt;((?:(?!&lt;\/a&gt;)[^\n]){1,200})&lt;\/a&gt;/gi;

/** Sobre texto YA escapado: devuelve las etiquetas permitidas a su forma HTML. */
export function permitirEtiquetasBasicas(escapado: string): string {
  return escapado.replace(ETIQUETA_ESCAPADA, (_m, cierre: string, tag: string) =>
    tag.toLowerCase() === 'br' ? '<br>' : `<${cierre}${tag.toLowerCase()}>`);
}

export function enlaceHtml(url: string, texto: string): string {
  return `<a href="${url}" target="_blank" rel="nofollow noopener">${texto}</a>`;
}

/** Texto plano (o HTML del usuario) → HTML seguro con solo formato básico y enlaces https. */
export function htmlBasico(texto: string): string {
  if (!texto) return '';
  return permitirEtiquetasBasicas(
    escaparHtml(decodificarEntidades(texto))
      .replace(ENLACE_HTML_ESCAPADO, (_m, url: string, txt: string) => enlaceHtml(url, txt)),
  );
}

import { Pipe, PipeTransform } from '@angular/core';

/**
 * #hashtag en texto: mismo criterio que HashtagHelper del API (letras con acentos, números y "_", de 2 a 40) y sin
 * letra, número, "&" (entidades HTML como &#39;) ni "/" (URLs con #ancla) pegado antes del "#".
 */
const HASHTAG = /(^|[^\p{L}\p{N}_&/])#([\p{L}\p{N}_]{2,40})(?![\p{L}\p{N}_])/gu;

/** Convierte los #hashtags de un texto plano (ya escapado) en enlaces a /hashtag/:tag. */
export function enlazarHashtagsTexto(texto: string): string {
  return texto.replace(
    HASHTAG,
    (_m, antes: string, tag: string) => `${antes}<a class="te-tag" href="/hashtag/${encodeURIComponent(tag.toLowerCase())}">#${tag}</a>`,
  );
}

/** Etiquetas dentro de las cuales no se tocan los "#": ya son enlaces o son código. */
const NO_ENLAZAR = new Set(['a', 'code', 'pre', 'script', 'style', 'textarea']);

/**
 * Enlaza los #hashtags del HTML de un post o tema. Solo toca los nodos de texto: nunca atributos (href="#ancla",
 * style="color:#fff") ni lo que ya está dentro de <a>, <code> o <pre>.
 */
export function enlazarHashtagsHtml(html: string): string {
  if (!html || !html.includes('#')) return html ?? '';

  const partes = html.split(/(<[^>]+>)/g);
  const abiertas: string[] = [];
  return partes
    .map((parte) => {
      if (parte.startsWith('<')) {
        const m = /^<\s*(\/)?\s*([a-zA-Z0-9]+)/.exec(parte);
        if (m) {
          const nombre = m[2].toLowerCase();
          if (NO_ENLAZAR.has(nombre) && !/\/>$/.test(parte)) {
            if (m[1]) {
              const i = abiertas.lastIndexOf(nombre);
              if (i >= 0) abiertas.splice(i, 1);
            } else {
              abiertas.push(nombre);
            }
          }
        }
        return parte;
      }
      return abiertas.length || !parte.includes('#') ? parte : enlazarHashtagsTexto(parte);
    })
    .join('');
}

@Pipe({ name: 'enlazarHashtags' })
export class EnlazarHashtagsPipe implements PipeTransform {
  transform(html: string | null | undefined): string {
    return enlazarHashtagsHtml(html ?? '');
  }
}

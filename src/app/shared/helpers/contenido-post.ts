// Utilidades puras sobre el HTML de un post (sin DOM: funcionan también en el render del servidor).

/** Lenguajes que se pueden elegir en un bloque de código. Se guardan como clase `language-<id>` en el <pre>. */
export const LENGUAJES_CODIGO: { id: string; nombre: string }[] = [
  { id: 'bash', nombre: 'Bash / Shell' },
  { id: 'powershell', nombre: 'PowerShell' },
  { id: 'dockerfile', nombre: 'Dockerfile' },
  { id: 'yaml', nombre: 'YAML' },
  { id: 'json', nombre: 'JSON' },
  { id: 'xml', nombre: 'HTML / XML' },
  { id: 'css', nombre: 'CSS' },
  { id: 'javascript', nombre: 'JavaScript' },
  { id: 'typescript', nombre: 'TypeScript' },
  { id: 'python', nombre: 'Python' },
  { id: 'csharp', nombre: 'C#' },
  { id: 'java', nombre: 'Java' },
  { id: 'php', nombre: 'PHP' },
  { id: 'sql', nombre: 'SQL' },
  { id: 'cpp', nombre: 'C / C++' },
  { id: 'go', nombre: 'Go' },
  { id: 'rust', nombre: 'Rust' },
  { id: 'ini', nombre: 'INI / TOML' },
  { id: 'nginx', nombre: 'Nginx' },
  { id: 'plaintext', nombre: 'Texto plano' },
];

export interface TituloIndice {
  id: string;
  texto: string;
  nivel: 2 | 3;
}

const PALABRAS_POR_MINUTO = 200;

function textoPlano(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Minutos estimados de lectura (mínimo 1). */
export function minutosDeLectura(html: string | null | undefined): number {
  const palabras = textoPlano(html || '').split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO));
}

/** Id legible para un título ("Paso 1: Docker" -> "paso-1-docker"). */
export function slugTitulo(texto: string): string {
  const slug = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'seccion';
}

/**
 * Títulos H2/H3 del contenido, en orden, con ids únicos. La directiva `appContenidoPost` asigna esos mismos ids a
 * los títulos del DOM (mismo orden, mismo algoritmo), así el índice funciona aunque se haya armado en el servidor.
 */
export function indiceDeContenido(html: string | null | undefined): TituloIndice[] {
  const titulos: TituloIndice[] = [];
  const usados = new Map<string, number>();
  const regex = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  for (let m = regex.exec(html || ''); m; m = regex.exec(html || '')) {
    const texto = textoPlano(m[2]);
    if (!texto) continue;
    titulos.push({ id: idUnico(slugTitulo(texto), usados), texto, nivel: m[1] === '2' ? 2 : 3 });
  }
  return titulos;
}

export function idUnico(base: string, usados: Map<string, number>): string {
  const n = usados.get(base) ?? 0;
  usados.set(base, n + 1);
  return n === 0 ? `t-${base}` : `t-${base}-${n + 1}`;
}

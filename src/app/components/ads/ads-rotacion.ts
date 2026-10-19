/** Componentes propios que se pueden poner en un espacio de publicidad. */
export const COMPONENTES_ANUNCIO = [{ id: 'discord', nombre: 'Discord' }] as const;
export type ComponenteAnuncio = (typeof COMPONENTES_ANUNCIO)[number]['id'];
export type VarianteAnuncio = 'cuadrado' | 'horizontal';

/** Un anuncio de la rotación de un tamaño: HTML libre o un componente del sitio. */
export interface Anuncio {
  tipo: 'html' | 'componente';
  html?: string;
  componente?: ComponenteAnuncio;
  variante?: VarianteAnuncio;
}

/**
 * Cada banner de Configuracion guarda una lista JSON de anuncios. Lo guardado antes (HTML suelto) se lee como una
 * lista de un solo anuncio HTML, así no hace falta migrar nada.
 */
export function leerAnuncios(valor: string | null | undefined): Anuncio[] {
  const texto = (valor ?? '').trim();
  if (!texto) return [];
  if (texto.startsWith('[')) {
    try {
      const lista = JSON.parse(texto) as Anuncio[];
      if (Array.isArray(lista)) {
        return lista.filter((a) => (a?.tipo === 'html' && a.html?.trim()) || (a?.tipo === 'componente' && a.componente));
      }
    } catch {
      // No era JSON: se trata como HTML.
    }
  }
  return [{ tipo: 'html', html: texto }];
}

export function escribirAnuncios(lista: Anuncio[]): string {
  const validos = lista
    .map((a) =>
      a.tipo === 'componente'
        ? { tipo: 'componente' as const, componente: a.componente, variante: a.variante ?? 'cuadrado' }
        : { tipo: 'html' as const, html: (a.html ?? '').trim() }
    )
    .filter((a) => (a.tipo === 'html' ? !!a.html : !!a.componente));
  return validos.length ? JSON.stringify(validos) : '';
}

export function anuncioAlAzar(lista: Anuncio[]): Anuncio | null {
  return lista.length ? lista[Math.floor(Math.random() * lista.length)] : null;
}

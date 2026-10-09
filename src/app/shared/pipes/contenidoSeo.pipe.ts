import { Pipe, PipeTransform } from '@angular/core';

/**
 * Prepara el HTML que escriben los usuarios (posts, temas) antes de inyectarlo:
 * las imagenes del contenido son la mayoria de las imagenes reales del sitio y
 * venian sin alt, sin lazy y sin dimensiones.
 *
 * Solo agrega atributos a las <img> que no los tengan: no reescribe ni filtra
 * el resto del HTML (de eso se encarga el saneado del servidor).
 */
@Pipe({ name: 'contenidoSeo', })
export class ContenidoSeoPipe implements PipeTransform {
  private static readonly IMG = /<img\b[^>]*?\/?>/gis;

  transform(html: string, titulo: string = ''): string {
    if (!html) {
      return '';
    }

    return html.replace(ContenidoSeoPipe.IMG, (tag) => this.mejorarImagen(tag, titulo));
  }

  private mejorarImagen(tag: string, titulo: string): string {
    let atributos = '';

    if (!/\salt\s*=/i.test(tag)) {
      atributos += ` alt="${this.escapar(titulo)}"`;
    }

    if (!/\sloading\s*=/i.test(tag)) {
      atributos += ' loading="lazy"';
    }

    if (!/\sdecoding\s*=/i.test(tag)) {
      atributos += ' decoding="async"';
    }

    if (!atributos) {
      return tag;
    }

    // Se respeta el cierre original (`>` o `/>`) para no romper el markup.
    const autocierre = /\/>$/.test(tag.trim());
    const cuerpo = tag.trim().replace(/\/?>$/, '');

    return `${cuerpo}${atributos}${autocierre ? ' />' : '>'}`;
  }

  private escapar(valor: string): string {
    return (valor || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

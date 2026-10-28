import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

type Parte = { tipo: 'texto'; valor: string } | { tipo: 'tag'; valor: string } | { tipo: 'mencion'; valor: string };

/** Mismo criterio que HashtagHelper del API: letras (con acentos), números y "_", de 2 a 40; @usuario como en las menciones. */
const PATRON = /(?<![\p{L}\p{N}_&])#([\p{L}\p{N}_]{2,40})|(?<![\w@])@([A-Za-z0-9_]{2,30})/gu;

/** Divide el texto en partes; los #tags y las @menciones se vuelven enlaces. */
export function partirTexto(texto: string): Parte[] {
  const partes: Parte[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(PATRON)) {
    const inicio = m.index ?? 0;
    if (inicio > ultimo) partes.push({ tipo: 'texto', valor: texto.slice(ultimo, inicio) });
    partes.push(m[1] ? { tipo: 'tag', valor: m[1] } : { tipo: 'mencion', valor: m[2] });
    ultimo = inicio + m[0].length;
  }
  if (ultimo < texto.length) partes.push({ tipo: 'texto', valor: texto.slice(ultimo) });
  return partes;
}

/**
 * Texto de un shout con #hashtags (llevan a /hashtag/:tag) y @menciones (al perfil) como enlaces.
 * Va dentro del elemento que ya da formato (white-space: pre-wrap); no agrega espacios propios.
 */
@Component({
  selector: 'app-texto-enlazado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `@for (p of partes(); track $index) {@switch (p.tipo) {@case ('tag') {<a class="te-tag" [routerLink]="['/hashtag', p.valor.toLowerCase()]">#{{ p.valor }}</a>}@case ('mencion') {<a class="te-mencion" [routerLink]="['/perfil', p.valor]">{{ '@' }}{{ p.valor }}</a>}@default {{{ p.valor }}}}}`,
  styles: `
    :host { display: contents; }
    a { font-weight: 600; color: light-dark(#006595, #8ed2f2); text-decoration: none; }
    a:hover { text-decoration: underline; }
  `,
})
export class TextoEnlazadoComponent {
  readonly texto = input<string | null | undefined>('');
  readonly partes = computed(() => partirTexto(this.texto() ?? ''));
}

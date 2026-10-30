import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { buscarEmote, RUTA_EMOTES } from 'src/app/shared/helpers/emotes';

type Parte =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'tag'; valor: string }
  | { tipo: 'mencion'; valor: string }
  | { tipo: 'emote'; valor: string; src: string };

/**
 * Mismo criterio que HashtagHelper del API: letras (con acentos), números y "_", de 2 a 40; @usuario como en las
 * menciones; :codigo: de los emotes de Taringa! (los que no existen quedan como texto).
 */
const PATRON = /(?<![\p{L}\p{N}_&])#([\p{L}\p{N}_]{2,40})|(?<![\w@])@([A-Za-z0-9_]{2,30})|:([A-Za-z0-9]+):/gu;

/** Divide el texto en partes; los #tags y las @menciones se vuelven enlaces y los :emotes: imágenes. */
export function partirTexto(texto: string): Parte[] {
  const partes: Parte[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(PATRON)) {
    const emote = m[3] ? buscarEmote(m[3]) : undefined;
    if (m[3] && !emote) continue;
    const inicio = m.index ?? 0;
    if (inicio > ultimo) partes.push({ tipo: 'texto', valor: texto.slice(ultimo, inicio) });
    partes.push(
      emote
        ? { tipo: 'emote', valor: emote.codigo, src: RUTA_EMOTES + emote.archivo }
        : m[1]
          ? { tipo: 'tag', valor: m[1] }
          : { tipo: 'mencion', valor: m[2] },
    );
    ultimo = inicio + m[0].length;
  }
  if (ultimo < texto.length) partes.push({ tipo: 'texto', valor: texto.slice(ultimo) });
  return partes;
}

/**
 * Texto de un shout con #hashtags (llevan a /hashtag/:tag) y @menciones (al perfil) como enlaces, y :emotes: como GIF.
 * Va dentro del elemento que ya da formato (white-space: pre-wrap); no agrega espacios propios.
 */
import { UserPopoverDirective } from 'src/app/shared/directives/userPopover.directive';

@Component({
  selector: 'app-texto-enlazado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserPopoverDirective, RouterLink],
  template: `@for (p of partes(); track $index) {@switch (p.tipo) {@case ('tag') {<a class="te-tag" [routerLink]="['/hashtag', p.valor.toLowerCase()]">#{{ p.valor }}</a>}@case ('mencion') {<a class="te-mencion" [routerLink]="['/perfil', p.valor]" [appUserPopover]="p.valor">{{ '@' }}{{ p.valor }}</a>}@case ('emote') {<img class="emote" [src]="$any(p).src" [alt]="':' + p.valor + ':'" [title]="':' + p.valor + ':'" loading="lazy">}@default {{{ p.valor }}}}}`,
  styles: `
    :host { display: contents; }
    a { font-weight: 600; color: light-dark(#006595, #8ed2f2); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .emote { display: inline-block; max-height: 3em; vertical-align: middle; }
  `,
})
export class TextoEnlazadoComponent {
  readonly texto = input<string | null | undefined>('');
  readonly partes = computed(() => partirTexto(this.texto() ?? ''));
}

import { Pipe, PipeTransform } from '@angular/core';
import { reemplazarEmotesPost } from '../helpers/emotes';

/** `:codigo:` → GIF en el HTML de un post, solo si el autor dejó activada la opción "Emotes" (Post.Smileys). */
@Pipe({ name: 'emotesPost' })
export class EmotesPostPipe implements PipeTransform {
  transform(html: string | null | undefined, activos: boolean | null | undefined): string {
    if (!html) return '';
    return activos && html.includes(':') ? reemplazarEmotesPost(html) : html;
  }
}

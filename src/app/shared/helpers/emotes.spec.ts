import { reemplazarEmotesPost } from './emotes';

describe('reemplazarEmotesPost', () => {
  it('convierte los :codigo: conocidos del texto del post', () => {
    const html = reemplazarEmotesPost('<p>Hola :mario: y :noexiste:</p>');
    expect(html).toContain('<img class="emote" src="/assets/emotes/mario.gif"');
    expect(html).toContain(':noexiste:');
  });

  it('no toca lo que está dentro de <pre> o <code>', () => {
    const html = reemplazarEmotesPost('<pre><code>a = :mario:</code></pre><p>:mario:</p><code >:lol:</code >');
    expect(html).toContain('<code>a = :mario:</code>');
    expect(html).toContain('<code >:lol:</code >');
    expect(html.match(/class="emote"/g)?.length).toBe(1);
  });

  it('no toca atributos', () => {
    expect(reemplazarEmotesPost('<a title=":mario:" href="#">x</a>')).toBe('<a title=":mario:" href="#">x</a>');
  });
});

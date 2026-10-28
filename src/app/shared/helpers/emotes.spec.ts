import { GRUPOS_EMOTES, reemplazarEmotes } from './emotes';

describe('reemplazarEmotes', () => {
  it('convierte los códigos conocidos en su GIF, sin importar mayúsculas', () => {
    const html = reemplazarEmotes('hola :mario: y :LOL:');
    expect(html).toContain('<img class="emote" src="/assets/emotes/mario.gif" alt=":mario:"');
    expect(html).toContain('src="/assets/emotes/lol.gif"');
  });

  it('deja como texto los códigos que no existen y los horarios', () => {
    expect(reemplazarEmotes('a las 10:30:15 :noexiste:')).toBe('a las 10:30:15 :noexiste:');
  });

  it('no toca el interior de las etiquetas', () => {
    const enlace = '<a href="https://x.com/:mario:/">texto</a>';
    expect(reemplazarEmotes(enlace)).toBe(enlace);
  });

  it('los códigos son únicos', () => {
    const codigos = GRUPOS_EMOTES.flatMap((g) => g.emotes.map((e) => e.codigo));
    expect(new Set(codigos).size).toBe(codigos.length);
  });
});

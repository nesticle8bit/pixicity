// Emoticones v3 de Taringa! (paquete "v3_retro"). Los GIF están en assets/emotes.
/** Emoticón de imagen: se escribe `:codigo:` en el texto y al mostrarlo se reemplaza por el GIF. */
export interface Emote {
  codigo: string;
  archivo: string;
  nombre: string;
}

export interface GrupoEmotes {
  id: string;
  nombre: string;
  icono: string;
  emotes: Emote[];
}

const TARINGA: Emote[] = [
  { codigo: 'mario', archivo: 'mario.gif', nombre: 'Super Mario Bros corriendo' },
  { codigo: 'lala', archivo: 'mobe.gif', nombre: 'Carita cantando La La La' },
  { codigo: 'alaba', archivo: 'alabama.gif', nombre: 'Alabando / Reverencia' },
  { codigo: 'lpmqtp', archivo: 'lpmqtp.gif', nombre: 'LPMQTP enojado / Puteada' },
  { codigo: 'buenpost', archivo: 'buenpost.gif', nombre: 'Cartel Buen Post' },
  { codigo: 'auto', archivo: 'car.gif', nombre: 'Auto de carreras' },
  { codigo: 'headbang', archivo: 'bang.gif', nombre: 'Headbanging / Metalero' },
  { codigo: 'limon', archivo: 'limoon.gif', nombre: 'Limón' },
  { codigo: 'fantasma', archivo: 'fantasma.gif', nombre: 'Fantasma Boo' },
  { codigo: 'trago', archivo: '106.gif', nombre: 'Trago cóctel' },
  { codigo: 'buaa', archivo: '17.gif', nombre: 'Llanto desconsolado' },
  { codigo: 'cuadrada', archivo: '5.gif', nombre: 'Sonrisa cuadrada' },
  { codigo: 'angry', archivo: 'angry.gif', nombre: 'Enojado furioso' },
  { codigo: 'cold', archivo: 'cold.gif', nombre: 'Helado de frío' },
  { codigo: 'cool', archivo: 'cool.gif', nombre: 'Carita cool con lentes' },
  { codigo: 'globo', archivo: 'globo.gif', nombre: 'Globo aerostático' },
  { codigo: 'huh', archivo: 'huh.gif', nombre: 'Serio / Indiferente' },
  { codigo: 'q', archivo: 'pregunta.gif', nombre: 'Signo de pregunta' },
  { codigo: 'oops', archivo: 'red.gif', nombre: 'Sonrojado avergonzado' },
  { codigo: 'noo', archivo: 'sad2.gif', nombre: 'Grito NOOO' },
  { codigo: 'sonrisa', archivo: 'smile.gif', nombre: 'Sonrisa clásica' },
  { codigo: 'cry', archivo: 'crying.gif', nombre: 'Llorando gota' },
  { codigo: 'dudoso', archivo: 'unsure.gif', nombre: 'Duda / Inseguro' },
  { codigo: 'blaf', archivo: 'blaf.gif', nombre: 'Blaf' },
  { codigo: 'winky', archivo: 'winky.gif', nombre: 'Guiño winky' },
  { codigo: 'twisted', archivo: 'evil.gif', nombre: 'Diablito retorcido' },
  { codigo: 'jeje', archivo: 'grn.gif', nombre: 'Ojos achinados sonrientes' },
  { codigo: 'risa', archivo: 'laughing.gif', nombre: 'Risa carcajada' },
  { codigo: 'confundido', archivo: 's.gif', nombre: 'Signo de interrogación confundido' },
  { codigo: 'baba', archivo: 'drool.gif', nombre: 'Babeando baba' },
  { codigo: 'triste', archivo: 'sad.gif', nombre: 'Tristeza clásica' },
  { codigo: 'lengua', archivo: 'tongue.gif', nombre: 'Sacando lengua' },
  { codigo: 'roll', archivo: 'wassat.gif', nombre: 'Ojos girando' },
  { codigo: 'guino', archivo: 'wink.gif', nombre: 'Guiño clásico' },
  { codigo: 'crying', archivo: 'cry.gif', nombre: 'Llorando río de lágrimas' },
  { codigo: 'bobo', archivo: 'bobo.gif', nombre: 'Bobo' },
  { codigo: 'grin', archivo: 'grin.gif', nombre: 'Sonrisa amplia con dientes' },
  { codigo: 'idiot', archivo: 'idiot.gif', nombre: 'Idiota con cartel' },
  { codigo: 'shrug', archivo: 'shrug.gif', nombre: 'Encogimiento de hombros' },
  { codigo: '8s', archivo: '8s.gif', nombre: 'Ojos en ocho mareado' },
  { codigo: 'blind', archivo: '15.gif', nombre: 'Ciego con gafas oscuras' },
  { codigo: 'hot', archivo: 'hot.gif', nombre: 'Caliente acalorado' },
  { codigo: 'love', archivo: 'love.gif', nombre: 'Ojos de amor' },
  { codigo: 'zombie', archivo: 'zombie.gif', nombre: 'Zombie comecerebros' },
  { codigo: 'pacman', archivo: 'pacman.gif', nombre: 'Pacman' },
  { codigo: 'metal', archivo: 'metal.gif', nombre: 'Mano cornuta Metal' },
  { codigo: 'info', archivo: 'i.gif', nombre: 'Ícono información' },
  { codigo: 'exc', archivo: 'exclamacion.gif', nombre: 'Signo de exclamación' },
  { codigo: 'no', archivo: 'no.gif', nombre: 'Cartel NO' },
  { codigo: 'ok', archivo: 'ok.gif', nombre: 'Cartel OK' },
  { codigo: 'wow', archivo: 'wow.gif', nombre: 'Cartel WOW' },
  { codigo: 'lol', archivo: 'lol.gif', nombre: 'Cartel LOL' },
  { codigo: 'oo', archivo: 'papel.gif', nombre: 'Rollo de papel higiénico' },
  { codigo: 'rip', archivo: 'rip.gif', nombre: 'Lápida RIP' },
  { codigo: 'alien', archivo: 'koe.gif', nombre: 'Marciano alien verde' },
  { codigo: 'money', archivo: 'dolar.gif', nombre: 'Billete de dólar' },
  { codigo: 'culo', archivo: 'culo.gif', nombre: 'Culo' },
  { codigo: 'getalife', archivo: 'getalife.gif', nombre: 'Cartel Get a Life' },
];

const CLASICOS: Emote[] = [
  { codigo: 'eek', archivo: 'icon_eek.gif', nombre: 'Ojos desorbitados (eek)' },
  { codigo: 'cool2', archivo: 'icon_cool.gif', nombre: 'Cool con gafas' },
  { codigo: 'mad', archivo: 'icon_mad.gif', nombre: 'Enojado / Furia' },
  { codigo: 'razz', archivo: 'icon_razz.gif', nombre: 'Sacando lengua' },
  { codigo: 'mrgreen', archivo: 'icon_mrgreen.gif', nombre: 'Señor verde (legendario)' },
  { codigo: 'cry2', archivo: 'icon_cry.gif', nombre: 'Llorando retro' },
  { codigo: 'evil', archivo: 'icon_evil.gif', nombre: 'Malvado diablito' },
  { codigo: 'twisted2', archivo: 'icon_twisted.gif', nombre: 'Sonrisa retorcida' },
  { codigo: 'rolleyes', archivo: 'icon_rolleyes.gif', nombre: 'Ojos girando' },
  { codigo: 'idea', archivo: 'icon_idea.gif', nombre: 'Bombilla / Idea' },
  { codigo: 'arrow', archivo: 'icon_arrow.gif', nombre: 'Flecha' },
  { codigo: 'neutral', archivo: 'icon_neutral.gif', nombre: 'Neutral / Poker face' },
  { codigo: 'redface', archivo: 'icon_redface.gif', nombre: 'Avergonzado sonrojado' },
  { codigo: 'question', archivo: 'icon_question.gif', nombre: 'Signo de pregunta' },
  { codigo: 'exclaim', archivo: 'icon_exclaim.gif', nombre: 'Signo de exclamación' },
  { codigo: 'smile', archivo: 'icon_smile.gif', nombre: 'Sonrisa clásica retro' },
  { codigo: 'biggrin', archivo: 'icon_biggrin.gif', nombre: 'Risa grande retro' },
  { codigo: 'sad', archivo: 'icon_sad.gif', nombre: 'Triste retro' },
  { codigo: 'surprised', archivo: 'icon_surprised.gif', nombre: 'Sorprendido retro' },
  { codigo: 'confused', archivo: 'icon_confused.gif', nombre: 'Confundido retro' },
  { codigo: 'wink', archivo: 'icon_wink.gif', nombre: 'Guiño retro' },
];

const MARIO: Emote[] = [
  { codigo: 'mario2', archivo: 'mario-mario.gif', nombre: 'Mario clásico animado' },
  { codigo: 'luigi', archivo: 'mario-luigi.gif', nombre: 'Luigi animado' },
  { codigo: 'yoshi', archivo: 'mario-yoshi.gif', nombre: 'Yoshi animado' },
  { codigo: 'bowser', archivo: 'mario-bowser.gif', nombre: 'Bowser animado' },
  { codigo: 'wario', archivo: 'mario-wario.gif', nombre: 'Wario animado' },
  { codigo: 'waluigi', archivo: 'mario-waluigi.gif', nombre: 'Waluigi animado' },
  { codigo: 'peach', archivo: 'mario-peach.gif', nombre: 'Princesa Peach animada' },
  { codigo: 'daisy', archivo: 'mario-daisy.gif', nombre: 'Princesa Daisy animada' },
  { codigo: 'toad', archivo: 'mario-toad.gif', nombre: 'Toad animado' },
  { codigo: 'dk', archivo: 'mario-dk.gif', nombre: 'Donkey Kong animado' },
  { codigo: 'drmario', archivo: 'mario-drmario.gif', nombre: 'Dr. Mario animado' },
  { codigo: 'metalmario', archivo: 'mario-metalmario.gif', nombre: 'Metal Mario' },
  { codigo: 'goomba', archivo: 'mario-goomba.gif', nombre: 'Goomba animado' },
  { codigo: 'bobomb', archivo: 'mario-bobomb.gif', nombre: 'Bob-omb animado' },
  { codigo: 'boo', archivo: 'mario-boo.gif', nombre: 'Fantasma Boo animado' },
  { codigo: 'koopa', archivo: 'mario-koopa.gif', nombre: 'Koopa Troopa animado' },
  { codigo: 'shy', archivo: 'mario-shyguy.gif', nombre: 'Shy Guy animado' },
  { codigo: 'lakitu', archivo: 'mario-lakitu.gif', nombre: 'Lakitu animado' },
  { codigo: 'buzzy', archivo: 'mario-buzzy.gif', nombre: 'Buzzy Beetle animado' },
  { codigo: 'cheep', archivo: 'mario-cheep.gif', nombre: 'Cheep Cheep animado' },
  { codigo: 'dry', archivo: 'mario-drybones.gif', nombre: 'Dry Bones animado' },
];

export const GRUPOS_EMOTES: GrupoEmotes[] = [
  { id: 'taringa', nombre: 'Taringa!', icono: 'mobe.gif', emotes: TARINGA },
  { id: 'clasicos', nombre: 'Clásicos', icono: 'icon_mrgreen.gif', emotes: CLASICOS },
  { id: 'mario', nombre: 'Mario', icono: 'mario-mario.gif', emotes: MARIO },
];

export const RUTA_EMOTES = '/assets/emotes/';

const POR_CODIGO = new Map(GRUPOS_EMOTES.flatMap((g) => g.emotes).map((e) => [e.codigo, e]));

/** El emote de un código (sin los dos puntos, sin importar mayúsculas), o undefined si no existe. */
export const buscarEmote = (codigo: string): Emote | undefined => POR_CODIGO.get(codigo.toLowerCase());

/**
 * Reemplaza los `:codigo:` conocidos por su GIF en HTML ya escapado. Solo toca el texto fuera de las etiquetas
 * (no rompe URLs ni atributos); los códigos que no existen quedan como texto.
 */
export function reemplazarEmotes(html: string): string {
  return html
    .split(/(<[^>]*>)/)
    .map((parte, i) =>
      i % 2
        ? parte
        : parte.replace(/:([a-zA-Z0-9]+):/g, (texto, codigo: string) => {
            const e = buscarEmote(codigo);
            return e
              ? `<img class="emote" src="${RUTA_EMOTES}${e.archivo}" alt=":${e.codigo}:" title=":${e.codigo}:" loading="lazy">`
              : texto;
          }),
    )
    .join('');
}

/** Emojis del selector, por categoría (Unicode nativo: no hace falta descargar imágenes ni librerías). */
export interface CategoriaEmoji {
  id: string;
  nombre: string;
  icono: string;
  emojis: string[];
}

const lista = (s: string): string[] => s.split(' ').filter(Boolean);

export const CATEGORIAS_EMOJI: CategoriaEmoji[] = [
  {
    id: 'caras',
    nombre: 'Caras',
    icono: '😀',
    emojis: lista(
      '😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😙 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 ' +
        '😒 🙄 😬 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😦 😧 😨 ' +
        '😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾',
    ),
  },
  {
    id: 'gestos',
    nombre: 'Gestos',
    icono: '👍',
    emojis: lista(
      '👍 👎 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤝 🙏 👏 🙌 👐 🤲 💪 🦾 ✍️ 💅 🤳 👀 👁️ 👅 👄 🧠 ' +
        '🙋 🙇 🤦 🤷 💁 🙅 🙆 🧏 🏃 🚶 💃 🕺 👯 🧘',
    ),
  },
  {
    id: 'corazones',
    nombre: 'Corazones',
    icono: '❤️',
    emojis: lista(
      '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ❤️‍🔥 ❤️‍🩹 💋 💌 💐 🌹 🥀 💯 💢 💥 💫 💦 💨 🕳️ 💬 💭 💤',
    ),
  },
  {
    id: 'animales',
    nombre: 'Animales y naturaleza',
    icono: '🐶',
    emojis: lista(
      '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 ' +
        '🕷️ 🐢 🐍 🦎 🐙 🦑 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦒 🐪 🐄 🐎 🐖 🐑 🐐 🦌 🐕 🐈 🐓 🦃 🕊️ 🐇 🐿️ 🦔 ' +
        '🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🍁 🍂 🍃 🌺 🌻 🌼 🌷 🌸 🌞 🌝 🌚 🌙 ⭐ 🌟 ✨ ⚡ 🔥 🌈 ☀️ ⛅ ☁️ 🌧️ ⛈️ ❄️ ☃️ 🌊',
    ),
  },
  {
    id: 'comida',
    nombre: 'Comida y bebida',
    icono: '🍕',
    emojis: lista(
      '🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🥑 🍆 🥔 🥕 🌽 🌶️ 🥒 🥦 🧄 🧅 🍄 🥜 🍞 🥐 🥖 🧀 🥚 🍳 🥓 ' +
        '🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🌮 🌯 🥗 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍦 🍩 🍪 🎂 🍰 🧁 🍫 🍬 🍭 🍿 ☕ 🍵 🧉 🥤 🍺 🍻 ' +
        '🥂 🍷 🥃 🍸 🍹 🍾',
    ),
  },
  {
    id: 'actividades',
    nombre: 'Actividades',
    icono: '⚽',
    emojis: lista(
      '⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🏓 🏸 🥊 🥋 ⛳ 🎣 🎽 🛹 ⛸️ 🎿 🏆 🥇 🥈 🥉 🏅 🎖️ 🎗️ 🎫 🎟️ 🎪 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 ' +
        '🎷 🎺 🎸 🎻 🎲 ♟️ 🎯 🎳 🎮 🕹️ 🧩 🎉 🎊 🎈 🎁',
    ),
  },
  {
    id: 'objetos',
    nombre: 'Viajes y objetos',
    icono: '💡',
    emojis: lista(
      '🚗 🚕 🚌 🏎️ 🚓 🚑 🚒 🚚 🚜 🏍️ 🚲 ✈️ 🚀 🛸 🚁 ⛵ 🚢 🗺️ 🗽 🗼 🏰 🏟️ 🏖️ 🏝️ 🌋 ⛰️ 🏠 🏢 ⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🖱️ 💾 ' +
        '💿 📷 📸 📹 🎥 📺 📻 ⏰ 🔋 🔌 💡 🔦 💸 💵 💰 💳 💎 ⚖️ 🔧 🔨 ⚙️ 🔫 💣 🔪 🛡️ 🔮 💊 💉 🧪 🔬 🔭 📡 🧻 🚽 🛒 🎀 ' +
        '📦 📫 📝 📁 📅 📌 📎 ✂️ 🔒 🔑 📚 📖 🔖 🏷️',
    ),
  },
  {
    id: 'simbolos',
    nombre: 'Símbolos',
    icono: '✅',
    emojis: lista(
      '✅ ☑️ ✔️ ❌ ❎ ➕ ➖ ➗ ✖️ ❓ ❔ ❕ ❗ ‼️ ⁉️ ⚠️ 🚫 ⛔ 🔞 📵 ♻️ 🔰 ⭕ 🆗 🆕 🆒 🆓 🆙 🔝 🔜 🔙 ▶️ ⏸️ ⏹️ ⏺️ ⏭️ ' +
        '⏮️ 🔀 🔁 🔄 ⬆️ ⬇️ ⬅️ ➡️ ↗️ ↘️ ↙️ ↖️ 🎵 🎶 💲 ©️ ®️ ™️ 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟥 🟧 🟨 🟩 🟦 🟪 ⬛ ⬜ 🔶 🔷 🏁 🚩 ' +
        '🏳️ 🏴 🏳️‍🌈 🇦🇷 🇧🇴 🇨🇱 🇨🇴 🇨🇷 🇨🇺 🇪🇨 🇸🇻 🇪🇸 🇬🇹 🇭🇳 🇲🇽 🇳🇮 🇵🇦 🇵🇾 🇵🇪 🇵🇷 🇩🇴 🇺🇾 🇻🇪 🇺🇸 🇧🇷',
    ),
  },
];

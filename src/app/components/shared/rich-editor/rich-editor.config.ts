import { INLINE_FORMAT_TAGS } from './rich-editor-dom';

// Tipos y constantes del editor (sin estado): los usa el componente y sus piezas (bubble, tablas).

export type InlineMark = 'bold' | 'italic' | 'underline' | 'strike' | 'code';
export type ToolbarMenu = 'heading' | 'color' | 'image' | 'table';
export type ImgAlign = 'izq' | 'centro' | 'der';
export type BubbleMode = 'format' | 'link' | 'edit-link';
export type StyleProp = 'color' | 'backgroundColor';

export interface EditorButton {
  icon: string;
  title: string;
  run: () => void;
  mark?: InlineMark; // si se indica, el botón refleja el estado activo de esa marca
}

export interface MenuButton {
  menu: ToolbarMenu;
  icon: string;
  title: string;
}

export interface ToolbarGroup {
  items: (EditorButton | MenuButton)[];
  secondary?: boolean; // en móvil queda detrás del botón "más"
}

export interface Palette {
  prop: StyleProp;
  label: string;
  resetTitle: string;
  colors: string[];
}

export interface TextOffsets {
  start: number;
  end: number;
}

/**
 * Cursor guardado mientras el foco está en otro lado (selector de archivos, prompt, emojis, campo del enlace).
 * `range` es un clon que sigue al DOM y distingue un renglón vacío o el lado de una imagen (los offsets de texto
 * no pueden: no cuentan imágenes ni párrafos vacíos, y la imagen terminaba al final del texto anterior).
 * `offsets` es el respaldo si ese nodo ya no existe (p. ej. un deshacer reemplazó todo el HTML).
 */
export interface PosicionGuardada {
  range: Range;
  offsets: TextOffsets | null;
}

export interface HistoryEntry {
  html: string;
  sel: TextOffsets | null;
}

// Tags que representan cada marca inline (`create` es el que se inserta)
export const INLINE_MARKS: Record<InlineMark, { tags: string[]; create: string }> = {
  bold:      { tags: ['STRONG', 'B'], create: 'strong' },
  italic:    { tags: ['EM', 'I'], create: 'em' },
  underline: { tags: ['U'], create: 'u' },
  strike:    { tags: ['S', 'STRIKE', 'DEL'], create: 's' },
  code:      { tags: ['CODE'], create: 'code' },
};

// Atajos estilo markdown al escribir un prefijo + espacio al inicio de un párrafo
export const BLOCK_SHORTCUTS: { pattern: RegExp; block: string }[] = [
  { pattern: /^#{1,6}$/, block: 'heading' },
  { pattern: /^[-*+]$/, block: 'UL' },
  { pattern: /^1[.)]$/, block: 'OL' },
  { pattern: /^>$/, block: 'blockquote' },
  { pattern: /^```$/, block: 'pre' },
  { pattern: /^-{3}$/, block: 'hr' },
];

// Atajos inline al cerrar el delimitador: `código`, **negrita**, *cursiva*, _cursiva_
// `open`: largo del delimitador de apertura; `typed`: parte del cierre ya escrita
export const INLINE_SHORTCUTS: { key: string; pattern: RegExp; tag: string; open: number; typed: number }[] = [
  { key: '`', pattern: /`([^`]+)$/, tag: 'code', open: 1, typed: 0 },
  { key: '*', pattern: /\*\*([^*]+)\*$/, tag: 'strong', open: 2, typed: 1 },
  { key: '*', pattern: /(?:^|[^*\w])\*([^*\s][^*]*)$/, tag: 'em', open: 1, typed: 0 },
  { key: '_', pattern: /(?:^|\s)_([^_\s][^_]*)$/, tag: 'em', open: 1, typed: 0 },
];

// Formato que quita "Eliminar formato" (los enlaces se conservan)
export const CLEARABLE_TAGS = INLINE_FORMAT_TAGS.filter((t) => t !== 'A');
// HTML pegado: marcas que el editor no crea pero sí puede limpiar
CLEARABLE_TAGS.push('FONT', 'MARK', 'SMALL', 'BIG', 'SUB', 'SUP', 'INS');
// Bloques que "Quitar formato" convierte en párrafo
export const PLAIN_BLOCK_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE', 'BLOCKQUOTE', 'DIV'];
// Elementos de bloque que no son "líneas" de texto (se insertan entre bloques, nunca dentro de un <p>)
export const STANDALONE_TAGS = ['UL', 'OL', 'HR', 'TABLE', 'FIGURE'];
export const IMG_ALIGN_CLASSES = ['img-izq', 'img-centro', 'img-der'];
export const TABLE_PICKER_SIZE = 6;

// Mismas reglas que POST /api/fotos/imagenes (ImageUploadHelper.FotoMaxBytes)
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;

// Separación entre la selección y el bubble, y margen mínimo contra los bordes
export const BUBBLE_GAP = 8;
export const BUBBLE_EDGE = 4;
export const HISTORY_LIMIT = 200;

// Paleta de color de texto y de resaltado (menú de la toolbar y bubble)
export const PALETAS: Palette[] = [
  {
    prop: 'color', label: 'Texto', resetTitle: 'Sin color',
    colors: [
      '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#ffffff',
      '#ff0000', '#ff4500', '#ff8c00', '#ffd700', '#adff2f', '#008000', '#00ced1', '#0000ff',
      '#8b008b', '#ff1493', '#ff69b4', '#a52a2a', '#d2691e', '#f4a460', '#deb887', '#2e8b57',
    ],
  },
  {
    prop: 'backgroundColor', label: 'Resaltado', resetTitle: 'Sin resaltado',
    colors: [
      '#fff59d', '#ffe0b2', '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb',
      '#b2ebf2', '#c8e6c9', '#dcedc8', '#e0e0e0',
    ],
  },
];

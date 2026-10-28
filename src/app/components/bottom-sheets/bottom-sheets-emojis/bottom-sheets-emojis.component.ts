import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { GRUPOS_EMOTES, RUTA_EMOTES } from 'src/app/shared/helpers/emotes';
import { CATEGORIAS_EMOJI, CategoriaEmoji } from './emojis.data';

const CLAVE_RECIENTES = 'emojis-recientes';
const MAX_RECIENTES = 24;

/**
 * Selector de emojis liviano (Unicode nativo, sin librerías). Se abre como popover junto al botón en escritorio y
 * como bottom sheet en móvil (ver ComentariosComponent.abrirEmojis); en ambos casos queda abierto para elegir
 * varios y avisa por `elegido`. `cerrar` pide al contenedor que lo cierre (Escape).
 */
@Component({
  selector: 'app-bottom-sheets-emojis',
  templateUrl: './bottom-sheets-emojis.component.html',
  styleUrls: ['./bottom-sheets-emojis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown.escape)': 'cerrar.emit()' },
})
export class BottomSheetsEmojisComponent {
  readonly elegido = output<string>();
  readonly cerrar = output<void>();

  /** Lo que se guarda (se actualiza con cada emoji) vs. lo que se muestra (fijo mientras está abierto). */
  private guardados = leerRecientes();
  readonly recientes = signal<string[]>(this.guardados);
  readonly categorias = computed<CategoriaEmoji[]>(() => {
    const recientes = this.recientes();
    return recientes.length
      ? [{ id: 'recientes', nombre: 'Usados recientemente', icono: '🕘', emojis: recientes }, ...CATEGORIAS_EMOJI]
      : CATEGORIAS_EMOJI;
  });
  /** Emoticones de imagen de Taringa!: se inserta `:codigo:` y el comentario lo muestra como GIF. */
  readonly conEmotes = signal(false);
  readonly gruposEmotes = GRUPOS_EMOTES;

  /** Pestaña elegida; sin elegir, la primera visible (los emotes van primero cuando se muestran). */
  private readonly elegidaId = signal<string | null>(null);
  readonly activaId = computed(
    () => this.elegidaId() ?? (this.conEmotes() ? this.gruposEmotes[0].id : this.categorias()[0].id),
  );
  readonly activa = computed(() => this.categorias().find((c) => c.id === this.activaId()) ?? this.categorias()[0]);

  elegirPestana(id: string): void {
    this.elegidaId.set(id);
  }
  readonly ruta = RUTA_EMOTES;
  readonly grupoEmotes = computed(() => this.gruposEmotes.find((g) => g.id === this.activaId()) ?? null);

  elegirEmote(codigo: string): void {
    this.elegido.emit(`:${codigo}: `);
  }

  elegir(emoji: string): void {
    // La lista visible no se reordena mientras está abierta (si no, el emoji "salta" bajo el cursor).
    this.guardados = [emoji, ...this.guardados.filter((e) => e !== emoji)].slice(0, MAX_RECIENTES);
    guardarRecientes(this.guardados);
    this.elegido.emit(emoji);
  }
}

function leerRecientes(): string[] {
  try {
    const valor = JSON.parse(localStorage.getItem(CLAVE_RECIENTES) ?? '[]');
    return Array.isArray(valor) ? valor.filter((e) => typeof e === 'string').slice(0, MAX_RECIENTES) : [];
  } catch {
    return [];
  }
}

function guardarRecientes(emojis: string[]): void {
  try {
    localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(emojis));
  } catch {
    // modo privado / almacenamiento bloqueado: solo se pierden los recientes
  }
}

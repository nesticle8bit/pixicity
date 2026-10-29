import { MatTooltip } from '@angular/material/tooltip';
import { ChangeDetectionStrategy, Component, ElementRef, input, output, TemplateRef, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';
import { BubbleMode, EditorButton, InlineMark } from './rich-editor.config';

/**
 * Bubble flotante del editor (estilo Notion): formato de la selección, vista previa del enlace bajo el caret o su
 * edición. Solo presenta: el editor decide cuándo mostrarlo, dónde (top/left) y qué hace cada botón.
 */
@Component({
  selector: 'app-rich-editor-bubble',
  templateUrl: './rich-editor-bubble.component.html',
  styleUrls: ['./rich-editor-bubble.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTooltip, MatIcon, NgTemplateOutlet],
})
export class RichEditorBubbleComponent {
  readonly modo = input<BubbleMode | null>(null);
  readonly debajo = input(false);
  readonly top = input(0);
  readonly left = input(0);
  readonly flechaX = input(0);
  readonly marcas = input<EditorButton[]>([]);
  readonly activas = input<Set<InlineMark>>(new Set());
  readonly mostrarColores = input(false);
  readonly href = input('');
  /** Paleta de colores del editor (la misma plantilla que usa el menú de la toolbar). */
  readonly paleta = input.required<TemplateRef<{ $implicit: boolean }>>();

  readonly mantenerSeleccion = output<MouseEvent>();
  readonly editarEnlace = output<void>();
  readonly alternarColores = output<void>();
  readonly quitarFormato = output<void>();
  readonly quitarEnlace = output<void>();
  readonly aplicarEnlace = output<void>();
  readonly cancelarEnlace = output<void>();

  /** El editor mide el bubble (offsetWidth/Height) para posicionarlo. */
  readonly elemento = viewChild.required<ElementRef<HTMLDivElement>>('bubbleEl');
  readonly inputEnlace = viewChild<ElementRef<HTMLInputElement>>('linkInputEl');
}

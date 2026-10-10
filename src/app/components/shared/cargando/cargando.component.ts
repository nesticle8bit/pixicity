import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Indicador de carga del sitio (reemplaza al GIF min-carga): anillo con el color de la marca, solo CSS.
 *
 * - `tamano`: 'sm' (16 px, dentro de botones), 'md' (28 px) o 'lg' (40 px, carga de página).
 * - `texto`: se muestra al lado; sin texto, igual se anuncia "Cargando…" a lectores de pantalla.
 * - `decorativo`: dentro de un botón que ya dice "Guardando…": no se anuncia ni lleva role="status".
 * - Toma `currentColor` con `color="actual"` (p. ej. blanco sobre un botón azul).
 * Aparece con un pequeño retraso: si la carga es instantánea no "parpadea".
 */
@Component({
  selector: 'app-cargando',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cargando',
    '[class.cargando--sm]': "tamano() === 'sm'",
    '[class.cargando--lg]': "tamano() === 'lg'",
    '[class.cargando--actual]': "color() === 'actual'",
    '[attr.role]': "decorativo() ? null : 'status'",
    '[attr.aria-hidden]': 'decorativo() || null',
  },
  template: `
    <span class="cargando__anillo" aria-hidden="true"></span>
    @if (texto()) {
    <span class="cargando__texto">{{ texto() }}</span>
    } @else if (!decorativo()) {
    <span class="cargando__oculto">Cargando…</span>
    }
  `,
  styleUrl: './cargando.component.scss',
})
export class CargandoComponent {
  readonly tamano = input<'sm' | 'md' | 'lg'>('md');
  readonly texto = input<string>('');
  readonly color = input<'marca' | 'actual'>('marca');
  readonly decorativo = input(false);
}

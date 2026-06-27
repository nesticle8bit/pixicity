import { Directive, TemplateRef } from '@angular/core';

/**
 * Plantilla para renderizar cada opción del desplegable (soporta imágenes, íconos, etc.).
 * Uso: <ng-template appSelectOption let-item="item" let-index="index"> ... </ng-template>
 */
@Directive({
  standalone: false,
  selector: '[appSelectOption]',
})
export class SelectOptionDirective {
  constructor(public template: TemplateRef<any>) {}
}

/**
 * Plantilla para renderizar el valor seleccionado en la caja.
 * Uso: <ng-template appSelectLabel let-item="item"> ... </ng-template>
 */
@Directive({
  standalone: false,
  selector: '[appSelectLabel]',
})
export class SelectLabelDirective {
  constructor(public template: TemplateRef<any>) {}
}

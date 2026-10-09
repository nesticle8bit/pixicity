import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Plantilla para renderizar cada opción del desplegable (soporta imágenes, íconos, etc.).
 * Uso: <ng-template appSelectOption let-item="item" let-index="index"> ... </ng-template>
 */
@Directive({ selector: '[appSelectOption]', })
export class SelectOptionDirective {
  template = inject<TemplateRef<any>>(TemplateRef);
}

/**
 * Plantilla para renderizar el valor seleccionado en la caja.
 * Uso: <ng-template appSelectLabel let-item="item"> ... </ng-template>
 */
@Directive({ selector: '[appSelectLabel]', })
export class SelectLabelDirective {
  template = inject<TemplateRef<any>>(TemplateRef);
}

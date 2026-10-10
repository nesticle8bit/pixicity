import {
  Component,
  ContentChild,
  ElementRef,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  input,
  output,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { SelectLabelDirective, SelectOptionDirective } from './select-template.directives';
import { CdkOverlayOrigin, CdkConnectedOverlay } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';

/**
 * Select con autocompletado y búsqueda por texto parcial. Reemplaza a @ng-select.
 * Implementa ControlValueAccessor (funciona con formControlName y ngModel).
 *
 * Inputs estilo ng-select: items, bindLabel, bindValue, placeholder, clearable, searchable.
 * Plantillas opcionales: [appSelectOption] y [appSelectLabel] para renderizar íconos/imágenes.
 * (change) emite el item completo seleccionado (paridad con ng-select).
 */
@Component({
    selector: 'app-select',
    templateUrl: './select-autocomplete.component.html',
    styleUrls: ['./select-autocomplete.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectAutocompleteComponent),
            multi: true,
        },
    ],
    imports: [
        CdkOverlayOrigin,
        NgTemplateOutlet,
        CdkConnectedOverlay,
        FormsModule,
    ],
})
export class SelectAutocompleteComponent<T = unknown> implements ControlValueAccessor, OnChanges {
  /** El tipo de los items (T) se infiere de lo que se pase en [items]; (change) emite ese mismo tipo. */
  readonly items = input<readonly T[] | null | undefined>([]);
  readonly bindLabel = input<string>();
  readonly bindValue = input<string>();
  readonly placeholder = input('Seleccionar...');
  readonly clearable = input(true);
  readonly searchable = input(true);

  readonly change = output<T | null>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  @ContentChild(SelectOptionDirective, { read: TemplateRef }) optionTpl?: TemplateRef<unknown>;
  @ContentChild(SelectLabelDirective, { read: TemplateRef }) labelTpl?: TemplateRef<unknown>;

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  @Input() disabled = false;

  isOpen = false;
  search = '';
  /** Valor del control: el item o, con bindValue, la propiedad indicada (p. ej. un id). */
  value: unknown = null;
  selectedItem: T | null = null;

  private onChange: (v: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) this.syncSelected();
  }

  // ControlValueAccessor
  writeValue(value: unknown): void {
    this.value = value;
    this.syncSelected();
  }
  registerOnChange(fn: (v: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  private syncSelected(): void {
    if (this.value === null || this.value === undefined) {
      this.selectedItem = null;
      return;
    }
    const found = (this.items() || []).find((it) => this.valueOf(it) === this.value);
    // Sin bindValue, el propio valor es el item (listas de strings)
    this.selectedItem = found ?? (this.bindValue() ? this.selectedItem : (this.value as T));
  }

  valueOf(item: T | null): unknown {
    const bindValue = this.bindValue();
    return bindValue ? propiedad(item, bindValue) : item;
  }

  labelOf(item: T | null): string {
    if (item === null || item === undefined) return '';
    const bindLabel = this.bindLabel();
    return String((bindLabel ? propiedad(item, bindLabel) : item) ?? '');
  }

  get hasValue(): boolean { return this.value !== null && this.value !== undefined; }

  get filtered(): readonly T[] {
    const q = this.normalize(this.search);
    if (!q) return this.items() || [];
    return (this.items() || []).filter((it) => this.normalize(this.labelOf(it)).includes(q));
  }

  private normalize(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  open(): void {
    if (this.disabled || this.isOpen) return;
    this.isOpen = true;
    this.search = '';
    this.opened.emit();
    setTimeout(() => this.searchInput()?.nativeElement.focus(), 0);
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.onTouched();
    this.closed.emit();
  }

  toggle(): void { this.isOpen ? this.close() : this.open(); }

  select(item: T): void {
    this.value = this.valueOf(item);
    this.selectedItem = item;
    this.onChange(this.value);
    this.change.emit(item);
    this.close();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.value = null;
    this.selectedItem = null;
    this.onChange(null);
    this.change.emit(null);
  }

  isSelected(item: T): boolean { return this.valueOf(item) === this.value; }
}

function propiedad(item: unknown, clave: string): unknown {
  return item !== null && typeof item === 'object' ? (item as Record<string, unknown>)[clave] : undefined;
}

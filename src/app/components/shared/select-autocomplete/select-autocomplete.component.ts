import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectLabelDirective, SelectOptionDirective } from './select-template.directives';

/**
 * Select con autocompletado y búsqueda por texto parcial. Reemplaza a @ng-select.
 * Implementa ControlValueAccessor (funciona con formControlName y ngModel).
 *
 * Inputs estilo ng-select: items, bindLabel, bindValue, placeholder, clearable, searchable.
 * Plantillas opcionales: [appSelectOption] y [appSelectLabel] para renderizar íconos/imágenes.
 * (change) emite el item completo seleccionado (paridad con ng-select).
 */
@Component({
  standalone: false,
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
})
export class SelectAutocompleteComponent implements ControlValueAccessor, OnChanges {
  @Input() items: any[] = [];
  @Input() bindLabel?: string;
  @Input() bindValue?: string;
  @Input() placeholder = 'Seleccionar...';
  @Input() clearable = true;
  @Input() searchable = true;

  @Output() change = new EventEmitter<any>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @ContentChild(SelectOptionDirective, { read: TemplateRef }) optionTpl?: TemplateRef<any>;
  @ContentChild(SelectLabelDirective, { read: TemplateRef }) labelTpl?: TemplateRef<any>;

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  @Input() disabled = false;

  isOpen = false;
  search = '';
  value: any = null;
  selectedItem: any = null;

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) this.syncSelected();
  }

  // ControlValueAccessor
  writeValue(value: any): void {
    this.value = value;
    this.syncSelected();
  }
  registerOnChange(fn: (v: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  private syncSelected(): void {
    if (this.value === null || this.value === undefined) {
      this.selectedItem = null;
      return;
    }
    const found = (this.items || []).find((it) => this.valueOf(it) === this.value);
    // Sin bindValue, el propio valor es el item (listas de strings)
    this.selectedItem = found ?? (this.bindValue ? this.selectedItem : this.value);
  }

  valueOf(item: any): any { return this.bindValue ? item?.[this.bindValue] : item; }
  labelOf(item: any): any {
    if (item === null || item === undefined) return '';
    return this.bindLabel ? item?.[this.bindLabel] : item;
  }

  get hasValue(): boolean { return this.value !== null && this.value !== undefined; }

  get filtered(): any[] {
    const q = this.normalize(this.search);
    if (!q) return this.items || [];
    return (this.items || []).filter((it) => this.normalize(String(this.labelOf(it))).includes(q));
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
    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.onTouched();
    this.closed.emit();
  }

  toggle(): void { this.isOpen ? this.close() : this.open(); }

  select(item: any): void {
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

  isSelected(item: any): boolean { return this.valueOf(item) === this.value; }
}

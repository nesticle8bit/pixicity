import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-top-times-selector',
  templateUrl: './top-times-selector.component.html',
  styleUrls: ['./top-times-selector.component.scss'],
})
export class TopTimesSelectorComponent {
  @Input() selection: string = 'all';
  @Output() selectedDate = new EventEmitter<any>();

  public displayMenu: boolean = false;

  constructor(private elementRef: ElementRef) {}

  toggleMenu(): void {
    this.displayMenu = !this.displayMenu;
  }

  changeTop(date: string): void {
    this.selection = date;
    this.selectedDate.emit(date);

    this.displayMenu = false;
  }

  /** Cierra el menú cuando se hace click fuera del componente. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.displayMenu && !this.elementRef.nativeElement.contains(event.target)) {
      this.displayMenu = false;
    }
  }
}

import { Component, ElementRef, HostListener, Input, output, inject } from '@angular/core';

@Component({
    selector: 'app-top-times-selector',
    templateUrl: './top-times-selector.component.html',
    styleUrls: ['./top-times-selector.component.scss'],
})
export class TopTimesSelectorComponent {
  private elementRef = inject(ElementRef);

  @Input() selection: string = 'all';
  readonly selectedDate = output<any>();

  public displayMenu: boolean = false;

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

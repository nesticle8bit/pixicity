import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[pixicityUppercase]',
})
export class UppercaseDirective {
  constructor(public ref: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: any) {
    this.ref.nativeElement.value = event.target.value.toUpperCase();
  }
}

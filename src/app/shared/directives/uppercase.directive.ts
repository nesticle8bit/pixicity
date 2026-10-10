import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({ selector: '[pixicityUppercase]', })
export class UppercaseDirective {
  constructor(public ref: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    this.ref.nativeElement.value = (event.target as HTMLInputElement).value.toUpperCase();
  }
}

import { Directive, ElementRef, HostListener, output, inject } from "@angular/core";

@Directive({ selector: '[clickOutside]' })
export class ClickOutsideDirective {
    private elementRef = inject(ElementRef);


    readonly clickOutside = output<MouseEvent>();

    @HostListener('document:click', ['$event', '$event.target'])
    public onClick(event: MouseEvent, targetElement: EventTarget | null): void {
        if (!(targetElement instanceof HTMLElement)) {
            return;
        }
        const clickedInside = this.elementRef.nativeElement.contains(targetElement);

        if (!clickedInside) {
            this.clickOutside.emit(event);
        }
    }
}
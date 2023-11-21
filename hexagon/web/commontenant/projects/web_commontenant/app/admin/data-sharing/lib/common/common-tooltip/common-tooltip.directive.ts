import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ellipsisTooltip]'
})

export class IsEllipsisActiveDirective {

    /** Add hxgn-ellipsis class to the host element */
    @HostBinding('class.hxgn-ellipsis') ellipsisClass = true;

    constructor(private elementRef: ElementRef) {}

    /**
     * Event that is fired when mouse enters
     */
    @HostListener('mouseenter')
    onMouseEnter(): void {
        setTimeout(() => {
            const element = this.elementRef.nativeElement;
            if (element.offsetWidth < element.scrollWidth) {
            element.title = element.textContent;
            } else if (element.title) {
            element.removeAttribute('title');
            }
        }, 500);
    }
}

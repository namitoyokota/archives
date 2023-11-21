import { Directive, ElementRef, Input, Renderer2 } from "@angular/core";

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[autoTestId]'
})
export class AutoTestingIdDirective {

    /** id of testing attribute */
    private readonly attrName = 'auto-id'

    /** Testing id */
    @Input() autoTestId = '';

    constructor(elRef: ElementRef, renderer: Renderer2) {

        Promise.resolve().then(() => {
            renderer.setAttribute(elRef.nativeElement, this.attrName, this.autoTestId);
        });
    }
}
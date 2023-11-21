import { Component, Input } from '@angular/core';

@Component({
    selector: 'hxgn-commontenant-step-icon',
    templateUrl: 'step-icon.component.html',
    styleUrls: ['step-icon.component.scss']
})

export class StepIconComponent {

    /** Number for icon */
    @Input() stepNumber: number;

    /** Title for icon */
    @Input() stepTitle: string;

    /** Image to display for step icon */
    @Input() imageUrl: string;

    constructor() { }
}

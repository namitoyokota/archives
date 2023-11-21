import { Component, Input } from '@angular/core';

@Component({
    selector: 'hxgn-commontenant-step-indicator',
    templateUrl: 'step-indicator.component.html',
    styleUrls: ['step-indicator.component.scss']
})

export class StepIndicatorComponent {

    /** Token for indicator title */
    @Input() titleToken: string;

    /** The step that is currently selected */
    @Input() activeStep: number;

    /** The number of steps */
    @Input() stepCount: number;

    constructor() { }
}

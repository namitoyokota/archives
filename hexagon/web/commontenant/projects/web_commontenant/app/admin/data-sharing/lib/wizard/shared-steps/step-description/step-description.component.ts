import { Component, Input } from '@angular/core';

@Component({
    selector: 'hxgn-commontenant-step-description',
    templateUrl: 'step-description.component.html',
    styleUrls: ['step-description.component.scss']
})

export class StepDescriptionComponent {

    /** Description for step */
    @Input() description: string;

    /** Title for icon */
    @Input() stepTitle: string;

    /** Image to display for step icon */
    @Input() imageUrl: string;

    constructor() { }
}

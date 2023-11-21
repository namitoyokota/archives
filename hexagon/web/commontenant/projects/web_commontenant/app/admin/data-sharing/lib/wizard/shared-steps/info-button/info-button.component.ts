import { Component, Input } from '@angular/core';

@Component({
    selector: 'hxgn-commontenant-info-popover',
    templateUrl: 'info-button.component.html',
    styleUrls: [
        'info-button.component.scss'
    ]
})
export class InfoButtonComponent {

    /** Message to display */
    @Input() msg: string;

    constructor() { }
}

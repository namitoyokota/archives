import {
    Component,
    Input,
    Output,
    EventEmitter
    } from '@angular/core';

@Component({
    selector: 'hxgn-common-input',
    templateUrl: 'common-input.component.html',
    styleUrls: ['common-input.component.scss']
})

export class CommonInputComponent {
    /** True if the clear button should be displayed for the input */
    @Input() showClearBtn = false;

    /** Displays a search icon if the clear button is not already displayed */
    @Input() isSearchBox = false;

    /** Controls whether the valid icon or the error icon is displayed */
    @Input() isValid: boolean = undefined;

    /** Emits an event when the clear button is clicked */
    @Output() clearText: EventEmitter<void> = new EventEmitter<void>();

    constructor() { }

}

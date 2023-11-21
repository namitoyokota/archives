import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Time of the day picker component
 */
@Component({
    selector: 'hxgn-common-timepicker',
    templateUrl: 'common-timepicker.component.html',
    styleUrls: ['common-timepicker.component.scss']
})
export class CommonTimepickerComponent {

    /** Tracks the time string in the input */
    @Input() time: string;

    /** Whether input is disabled or enabled */
    @Input() disabled: boolean;

    /** Emits event when time field changes */
    @Output() timeChange = new EventEmitter<string>();

    constructor() {}

    /** Emits time string when input changes */
    updateTime() {
        this.timeChange.emit(this.time);
    }
}

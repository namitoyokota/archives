import { Component, EventEmitter, Input, Output, HostBinding } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';

@Component({
    selector: 'hxgn-common-input-v2',
    templateUrl: 'common-input.component.v2.html',
    styleUrls: ['common-input.component.v2.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class CommonInputComponent$v2 {

    /** True if the clear button should be displayed for the input */
    @Input() showClearBtn = false;

    /** Displays a search icon if the clear button is not already displayed */
    @Input() isSearchBox = false;

    /** Controls whether the valid icon or the error icon is displayed */
    @Input() isValid: boolean = undefined;

    /** Controls whether to display the lock/unlock icons.  The lock button will emit an event when pressed */
    @HostBinding('class.lock-button') @Input() showLockBtn = false;

    /** Controls whether to display the read only icon */
    @HostBinding('class.read-only-icon') @Input() showReadOnlyIcon = false;

    /** Provides a string to use as a tooltip for the field */
    @HostBinding('title') @Input() tooltip = '';

    /** Controls initial icon for the lock/unlock button */
    @Input() locked = false;

    /** Provides a string to use as a tooltip for the lock button */
    @Input() lockBtnTooltip: string;

    /** Controls whether or not the input is disabled. */
    @HostBinding('class.disabled') @Input() disabled = false;

    /** Emits an event when the clear button is clicked */
    @Output() clearText: EventEmitter<void> = new EventEmitter<void>();

    /** Emits an event when the lock button is clicked */
    @Output() toggleLocked: EventEmitter<void> = new EventEmitter<void>();

    /** Emits an event when the search button is clicked */
    @Output() searchClicked: EventEmitter<void> = new EventEmitter<void>();

    constructor(private localizationSrv: CommonlocalizationAdapterService$v1) { }
}

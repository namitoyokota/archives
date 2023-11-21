import { Component, HostBinding, Input } from '@angular/core';

@Component({
    selector: 'hxgn-common-initials',
    templateUrl: 'common-initials.component.html',
    styleUrls: ['common-initials.component.scss']
})
export class CommonInitialsComponent {
    /** The first name to display initials for */
    @Input() firstName: string;

    /** The last name to display initials for */
    @Input() lastName: string;

    /** Whether or not to give the initials a dark background. */
    @HostBinding('class.dark') @Input() dark = false;

    constructor() { }
}

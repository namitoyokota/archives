import { Component, Input } from '@angular/core';

@Component({
    selector: 'hxgn-common-description',
    templateUrl: './common-description.component.html',
    styleUrls: ['./common-description.component.scss']
})
export class CommonDescriptionComponent {

    /** Description to be shown. */
    @Input() description = '';

    constructor() { }
}

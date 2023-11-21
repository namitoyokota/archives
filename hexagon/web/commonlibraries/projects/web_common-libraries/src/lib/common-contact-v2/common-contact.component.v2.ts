import { Component, Input } from '@angular/core';
import { Person$v1 } from '@galileo/platform_common-libraries';

export enum CommonContactTranslationTokens$v2 {
    primaryContact = 'commonlibraries-main.component.primaryContact'
}

@Component({
    selector: 'hxgn-common-contact-v2',
    templateUrl: 'common-contact.component.v2.html',
    styleUrls: ['common-contact.component.v2.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class CommonContactComponent$v2 {

    /** The person's contact info. */
    @Input() contact: Person$v1;

    /** Whether or not to show the 'Primary Contact' title. */
    @Input() showTitle = true;

    /** Expose tokens to HTML */
    tokens: typeof CommonContactTranslationTokens$v2 = CommonContactTranslationTokens$v2;

    constructor() {}

}

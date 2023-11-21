import { Component, Input } from '@angular/core';

export enum CommonContactTranslationTokens {
    primaryContact = 'commonlibraries-main.component.primaryContact'
}

@Component({
    selector: 'hxgn-common-contact',
    templateUrl: 'common-contact.component.html',
    styleUrls: ['common-contact.component.scss']
})

export class CommonContactComponent {
    /**
     * The contact's first name
     */
    @Input() firstName: string;

    /**
     * The contact's last name
     */
    @Input() lastName: string;

    /**
     * The contact's title
     */
    @Input() title: string;

    /** Expose tokens to HTML */
    tokens: typeof CommonContactTranslationTokens = CommonContactTranslationTokens;

    constructor() {}

}

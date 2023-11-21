import { Component, EventEmitter, Output } from '@angular/core';
import { InternalSetupTranslationTokens } from './internal-setup.translation';

@Component({
    selector: 'hxgn-commontenant-internal-setup',
    templateUrl: 'internal-setup.component.html',
    styleUrls: ['internal-setup.component.scss']
})
export class InternalSetupComponent {

    /** Event when the wizard should be started */
    @Output() startWizard = new EventEmitter<boolean>();

    /** A flag that is true if filter internally by groups is enable */
    filterByGroups = null;

    /** Export InternalSetupTranslationTokens to HTML */
    tokens: typeof InternalSetupTranslationTokens = InternalSetupTranslationTokens;

    constructor() { }
}

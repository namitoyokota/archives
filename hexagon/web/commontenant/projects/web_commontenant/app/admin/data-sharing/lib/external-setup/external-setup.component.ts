import { Component, EventEmitter, Output } from '@angular/core';
import { ExternalSetupTranslationTokens } from './external-setup.translation';

@Component({
    selector: 'hxgn-commontenant-external-setup',
    templateUrl: 'external-setup.component.html',
    styleUrls: ['external-setup.component.scss']
})
export class ExternalSetupComponent {

    /** Event when the wizard should be started */
    @Output() startWizard = new EventEmitter<boolean>();

    /** Export InternalSetupTranslationTokens to HTML */
    tokens: typeof ExternalSetupTranslationTokens = ExternalSetupTranslationTokens;

    constructor() { }
}

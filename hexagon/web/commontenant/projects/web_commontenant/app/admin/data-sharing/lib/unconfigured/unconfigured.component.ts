import { Component, EventEmitter, Output } from '@angular/core';
import { UnconfiguredTranslationTokens } from './unconfigured.translation';

@Component({
    selector: 'hxgn-commontenant-data-sharing-unconfigured',
    templateUrl: 'unconfigured.component.html',
    styleUrls: ['unconfigured.component.scss']
})
export class UnconfiguredComponent {

    /** Emit that the setup external button has been clicked */
    @Output() setupExternal = new EventEmitter<void>();

    /** Emit that the setup internal button has been clicked */
    @Output() setupInternal = new EventEmitter<void>();

    /** Expose UnconfiguredTranslationTokens to HTML */
    tokens: typeof UnconfiguredTranslationTokens = UnconfiguredTranslationTokens;

    constructor() { }
}

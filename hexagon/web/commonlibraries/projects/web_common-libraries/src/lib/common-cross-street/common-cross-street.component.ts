import { Component, Input } from '@angular/core';
import { CrossStreetTranslationTokens } from './common-cross-street.translation';

@Component({
    selector: 'hxgn-common-cross-street',
    templateUrl: 'common-cross-street.component.html',
    styleUrls: ['common-cross-street.component.scss']
})

export class CommonCrossStreetComponent {

    /** First cross street */
    @Input() crossStreet1: string;

    /** Second cross street */
    @Input() crossStreet2: string;

    /** Expose tokens to HTML */
    tokens: typeof CrossStreetTranslationTokens = CrossStreetTranslationTokens;

    constructor() { }

}

import { Component } from '@angular/core';
import { TranslationTokens } from './low-filter.translate';

@Component({
    selector: 'hxgn-alarms-low-filter',
    templateUrl: 'low-filter.component.html',
    styleUrls: [
        '../create-data-filters.component.scss',
        'low-filter.component.scss'
    ]
})
export class LowFilterComponent {

    /** Expose the translation tokens to the html */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }
}

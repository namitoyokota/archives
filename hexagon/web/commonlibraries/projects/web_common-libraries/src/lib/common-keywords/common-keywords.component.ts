import { Component, Input } from '@angular/core';
import { CommonKeywordsTranslationTokens } from './common-keywords.translation';

@Component({
    selector: 'hxgn-common-keywords',
    templateUrl: 'common-keywords.component.html',
    styleUrls: ['common-keywords.component.scss']
})
export class CommonKeywordsComponent {

    /** Keywords to display. */
    @Input() keywords: string[] = [];

    /** Expose translation tokens to html. */
    tokens: typeof CommonKeywordsTranslationTokens = CommonKeywordsTranslationTokens;

    constructor() { }

}

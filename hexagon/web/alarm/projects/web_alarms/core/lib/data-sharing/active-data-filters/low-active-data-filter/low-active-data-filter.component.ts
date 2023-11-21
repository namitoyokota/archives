import { Component } from '@angular/core';
import { RestrictionLevels } from '@galileo/web_commontenant/adapter';

import { TranslationTokens } from './low-active-data-filter.translation';

@Component({
    selector: 'hxgn-alarms-low-active-data-filter',
    templateUrl: 'low-active-data-filter.component.html',
    styleUrls: ['low-active-data-filter.component.scss']
})
export class LowActiveDataFilterComponent {

    /** Expose the translation tokens to the html */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Expose restriction levels to html */
    RestrictionLevels: typeof RestrictionLevels = RestrictionLevels;

    constructor() { }
}

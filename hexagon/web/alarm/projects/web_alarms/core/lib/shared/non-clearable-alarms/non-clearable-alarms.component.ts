import { Component, Input } from '@angular/core';
import { TranslationTokens } from './non-clearable-alarms.translation';

@Component({
    selector: 'hxgn-alarms-non-clearable-alarms',
    templateUrl: 'non-clearable-alarms.component.html',
    styleUrls: ['non-clearable-alarms.component.scss']
})
export class NonClearableAlarmsComponent {

    /** Number of non clearable tokens. */
    @Input() nonClearableCount = 0;

    /** Expose translation tokens to html. */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

}

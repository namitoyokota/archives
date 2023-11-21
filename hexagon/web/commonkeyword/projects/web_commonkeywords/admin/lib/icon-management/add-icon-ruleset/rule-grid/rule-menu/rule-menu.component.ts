import { Component, EventEmitter, Output } from '@angular/core';
import { PopoverPosition } from '@galileo/web_common-libraries';

import { RuleMenuTranslationTokens } from './rule-menu.translation';

@Component({
    selector: 'hxgn-commonkeywords-rule-menu',
    templateUrl: 'rule-menu.component.html',
    styleUrls: ['rule-menu.component.scss']
})
export class RuleMenuComponent {

    /** Emit clone event */
    @Output() clone = new EventEmitter();

    /** Emit delete event */
    @Output() delete = new EventEmitter();

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** Expose RuleMenuTranslationTokens to HTML */
    tokens: typeof RuleMenuTranslationTokens = RuleMenuTranslationTokens;

    constructor() { }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RestrictionLevels$v1 } from '@galileo/web_commontenant/_common';

import { RestrictionLevelSelectorTranslationTokens } from './restriction-level-selector.translation';

@Component({
    selector: 'hxgn-commontenant-admin-restriction-level-selector',
    templateUrl: 'restriction-level-selector.component.html',
    styleUrls: ['restriction-level-selector.component.scss']
})
export class RestrictionLevelSelectorComponent {

    /** Selected level input. */
    @Input() selectedLevel: RestrictionLevels$v1;

    /** Level change output. */
    @Output() levelChange = new EventEmitter<RestrictionLevels$v1>();

    /** Expose restriction levels to the html template */
    RestrictionLevels: typeof RestrictionLevels$v1 = RestrictionLevels$v1;

    /** Expose tokens to the html */
    tokens: typeof RestrictionLevelSelectorTranslationTokens = RestrictionLevelSelectorTranslationTokens;

    constructor() { }

    /** Sets selected level. */
    setSelectedLevel(level: RestrictionLevels$v1) {
        this.selectedLevel = level;
        this.levelChange.emit(level);
    }
}

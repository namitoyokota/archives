import { Component, Input } from '@angular/core';
import { TranslationTokens } from './personnel-pane.translation';
import { Person$v1 } from '@galileo/platform_common-libraries';

/**
 * The display types possible for displaying personnel.
 */
enum DisplayType {
    // Show personnel as a grid
    grid = 'grid',

    // Show personnel as a list
    list = 'list'
}

@Component({
    selector: 'hxgn-common-personnel-pane',
    templateUrl: 'personnel-pane.component.html',
    styleUrls: ['personnel-pane.component.scss']
})
export class PersonnelPaneComponent {

    /** Personnel list data */
    @Input() personnel: Person$v1[];

    /** What display type is currently selected */
    selectedDisplayType: DisplayType = DisplayType.list;

    /** Export display type to the HTML */
    displayType: typeof DisplayType = DisplayType;

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /**
     * Sets the current display type to the type passed in
     * @param type The display type that is selected
     */
    setSelectedDisplayType(type: DisplayType) {
        this.selectedDisplayType = type;
    }

}

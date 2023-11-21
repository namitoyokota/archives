import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ListStep } from './list-step';
import { TranslationTokens } from './list-steps.translation';

@Component({
    selector: 'hxgn-common-list-steps',
    templateUrl: './list-steps.component.html',
    styleUrls: ['./list-steps.component.scss']
})
export class ListStepsComponent {

    /** The list of steps */
    @Input() listSteps: ListStep[];

    /** the selected index */
    @Input() selectedIndex = 0;

    /** Shows a disabled cursor when set to true */
    @Input() isDisabled = false;

    /** Relays back to the parent the index of the clicked step */
    @Output() indexChanged: EventEmitter<number> = new EventEmitter<number>();

    /** The currently selected step */
    selectedItem: ListStep = null;

    /**
     * Collection of known translation tokens
     */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /** returns true if the input item is the selected item */
    isSelected(index: number) {
        return index === this.selectedIndex;
    }

    /** Manually select a step */
    select(index: number) {
        if (!this.isDisabled) {
            this.selectedIndex = index;
            this.indexChanged.next(index);
        }
    }

}

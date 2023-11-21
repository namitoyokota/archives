import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SortingTranslationTokens } from './sorting.translations';
import { SortOptions } from './sort-options';

@Component({
    selector: 'hxgn-alarms-sorting',
    templateUrl: 'sorting.component.html',
    styleUrls: ['sorting.component.scss']
})

export class SortingComponent {

    /** How the list should be sorted */
    @Input() sortBy: SortOptions;

    /** Event when sort by changes */
    @Output() sortByChange = new EventEmitter<SortOptions>();

    /** Expose ListSortOptions to HTML */
    listSortOptions: typeof SortOptions = SortOptions;

    /** Expose SortingTranslationTokens to HTML */
    tokens: typeof SortingTranslationTokens = SortingTranslationTokens;

    constructor() { }

    /**
     * Sets how the list should be sorted
     * @param sortOption How the list should be sorted
     */
    setSortOption(sortOption: SortOptions) {
        this.sortByChange.emit(sortOption);
    }
}

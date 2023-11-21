import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ShapeListFilter$v1 } from '@galileo/web_shapes/_common';

import { SortOptions } from '../../../shared/sorting/sort-options';
import { OptionPaneTranslationTokens } from './option-pane.translation';
import { FilterOperation$v1 } from '@galileo/web_common-libraries';

@Component({
  selector: 'hxgn-shapes-option-pane',
  templateUrl: 'option-pane.component.html',
  styleUrls: ['option-pane.component.scss']
})

export class OptionPaneComponent {

    /** Filter that is active */
    @Input() activeFilter: ShapeListFilter$v1;

    /** Flag that is true when map syncing is enabled */
    @Input() enabledMapSyncing: boolean;

    /** How the list should be sorted */
    @Input() sortBy: SortOptions;

    /** Show the may sync option */
    @Input() showMapSync = true;

    /** Flag that is true when the reset to default button should be shown */
    @Input() showResetToDefault = false;

    /** Event when filter changes */
    @Output() filterChange = new EventEmitter<ShapeListFilter$v1>();

    /** Event when map sync changes */
    @Output() mapSync = new EventEmitter<boolean>();

    /** Event when sort by changes */
    @Output() sortByChange = new EventEmitter<SortOptions>();

    /** Event when the reset to default button is clicked */
    @Output() resetToDefault = new EventEmitter<void>();

    /** Expose ListSortOptions to HTML */
    listSortOptions: typeof SortOptions = SortOptions;

    /** Expose OptionPaneTranslationTokens to HTML */
    tokens: typeof OptionPaneTranslationTokens = OptionPaneTranslationTokens;

    constructor() { }

    /**
     * Sets the active filter
     * @param filter Updated filter
     */
    setActiveFilter(filter: ShapeListFilter$v1) {
        this.filterChange.emit(filter);
    }

    /**
     * Toggle the may sync state
     */
    toggleMapSync() {
        this.mapSync.emit(!this.enabledMapSyncing);
    }

    /**
     * Sets how the list should be sorted
     * @param sortOption How the list should be sorted
     */
    setSortOption(sortOption: SortOptions) {
        this.sortByChange.emit(sortOption);
    }

    /**
     * Returns list of active filter operations
     */
    getActiveFilterOperations(): FilterOperation$v1[] {
        return this.activeFilter.operations.filter(o => o.operationString && o.operationString.trim());
    }

    /**
     * Clears the applied filters
     */
    reset() {
        this.resetToDefault.emit();
    }
}

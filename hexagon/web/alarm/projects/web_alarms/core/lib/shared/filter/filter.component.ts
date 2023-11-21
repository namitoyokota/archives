import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlarmFilter$v1 } from '@galileo/web_alarms/_common';
import { FilterOperation$v1, FilterProperty } from '@galileo/web_common-libraries';

import { FilterTranslationTokens } from './filter.translation';

@Component({
    selector: 'hxgn-alarms-filter',
    templateUrl: 'filter.component.html',
    styleUrls: ['filter.component.scss']
})
export class FilterComponent {

    /** Filter that is currently being applied */
    @Input() filter: AlarmFilter$v1;

    /** Event that a filter has changed */
    @Output() filterChange = new EventEmitter<AlarmFilter$v1>();

    /** Expose FilterTranslationTokens to the HTML */
    tokens: typeof FilterTranslationTokens = FilterTranslationTokens;

    /** List of property options to filter on */
    propertyList: FilterProperty[] = [
        {
            property: 'title',
            propertyToken: FilterTranslationTokens.alarmTitle,
            placeHolderToken: FilterTranslationTokens.titlePlaceHolder
        },
        {
            property: 'keywords',
            propertyToken: FilterTranslationTokens.keyword,
            placeHolderToken: FilterTranslationTokens.keywordPlaceHolder
        },
        {
            property: 'priority',
            propertyToken: FilterTranslationTokens.priority,
            placeHolderToken: FilterTranslationTokens.priorityPlaceHolder
        }
    ];

    constructor() { }

    /**
     * Create a new filter operation
     */
    newFilter() {
        const updatedFilter = new AlarmFilter$v1(this.filter);
        updatedFilter.operations = updatedFilter.operations.concat([new FilterOperation$v1()]);

        this.filterChange.emit(updatedFilter);
    }

    /**
     * What to do when a filter operation changes
     * @param operation Operation that has changed
     * @param itemIndex Index of operation tha has changed
     */
    onFilterChange(operation: FilterOperation$v1, itemIndex: number) {
        const updatedFilter = new AlarmFilter$v1(this.filter);
        updatedFilter.operations[itemIndex] = operation;

        this.filterChange.emit(updatedFilter);
    }

    /**
     * Deletes a filter operation from the applied filter
     * @param index Index of filter operation to delete
     */
    deleteFilter(index: number) {
        const updatedFilter = new AlarmFilter$v1(this.filter);
        updatedFilter.operations = updatedFilter.operations.filter((item, i) => {
            return index !== i;
        });
        this.filterChange.emit(updatedFilter);
    }

    /**
     * Used to track a filter operation in a list
     * @param index Index of item in list
     * @param item Filter operation
     */
    filterOperationTrackBy(index, item) {
        return index;
    }

    /**
     * Returns list of active filter operations
     */
    getActiveFilterOperations() {
        return this.filter?.operations?.filter(o => o.operationString && o.operationString.trim());
    }
}

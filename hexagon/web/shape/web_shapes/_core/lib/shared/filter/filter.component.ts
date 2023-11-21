import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterOperation$v1, FilterProperty } from '@galileo/web_common-libraries';
import { ShapeListFilter$v1 } from '@galileo/web_shapes/_common';

import { FilterTranslationTokens } from './filter.translation';

@Component({
  selector: 'hxgn-shapes-filter',
  templateUrl: 'filter.component.html',
  styleUrls: ['filter.component.scss']
})
export class FilterComponent {

  /** Filter that is currently being applied */
  @Input() filter: ShapeListFilter$v1;

  /** Event that a filter has changed */
  @Output() filterChange = new EventEmitter<ShapeListFilter$v1>();

  /** Expose FilterTranslationTokens to the HTML */
  tokens: typeof FilterTranslationTokens = FilterTranslationTokens;

  /** List of property options to filter on */
  propertyList: FilterProperty[] = [
    {
      property: 'name',
      propertyToken: FilterTranslationTokens.shapeName,
      placeHolderToken: FilterTranslationTokens.namePlaceHolder
    },
    {
      property: 'keywords',
      propertyToken: FilterTranslationTokens.keyword,
      placeHolderToken: FilterTranslationTokens.keywordPlaceHolder
    },
    {
      property: 'filteringType',
      propertyToken: FilterTranslationTokens.filterType,
      placeHolderToken: FilterTranslationTokens.filterTypeFilterPlaceHolder
    }
  ];

  constructor() { }

  /**
   * Create a new filter operation
   */
  newFilter() {
    const updatedFilter = new ShapeListFilter$v1(this.filter);
    updatedFilter.operations = updatedFilter.operations.concat([new FilterOperation$v1()]);

    this.filterChange.emit(updatedFilter);
  }

  /**
   * What to do when a filter operation changes
   * @param operation Operation that has changed
   * @param itemIndex Index of operation tha has changed
   */
  onFilterChange(operation: FilterOperation$v1, itemIndex: number) {
    const updatedFilter = new ShapeListFilter$v1(this.filter);
    updatedFilter.operations[itemIndex] = operation;

    this.filterChange.emit(updatedFilter);
  }

  /**
   * Deletes a filter operation from the applied filter
   * @param index Index of filter operation to delete
   */
  deleteFilter(index: number) {
    const updatedFilter = new ShapeListFilter$v1(this.filter);
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

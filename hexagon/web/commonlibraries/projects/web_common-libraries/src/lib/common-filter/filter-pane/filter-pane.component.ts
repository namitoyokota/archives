import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Filter$v1 } from '../filter.v1';
import { FilterPaneTranslationTokens } from './filter-pane.translation';

/** @deprecated Should use FilterPaneComponent$v2 now */
@Component({
  selector: 'hxgn-common-filter-pane',
  templateUrl: 'filter-pane.component.html',
  styleUrls: ['filter-pane.component.scss'],
  animations: [
      trigger('expansionState', [
          state(':enter', style({ height: '*' })),
          state(':leave', style({ height: '0' })),
          state('void', style({ height: '0' })),
          transition('* => *', animate('300ms ease-in-out'))
      ])
  ]
})
export class FilterPaneComponent implements OnChanges {

  /** The filter that is currently active */
  @Input() activeFilter: Filter$v1<any>;

  /** Flag that is true when the filter sync is enabled */
  @Input() filterSyncEnabled = false;

  /** Text that is shown in the search box placeholder */
  @Input() searchText: string;

  /** A flag that is true when the map sync button is shown */
  @Input() showMapSync = true;

  /** Event that enable filter sync has been clicked */
  @Output() enableFilterSync = new EventEmitter<boolean>();

  /** Event when search string has changed */
  @Output() search = new EventEmitter<string>();

  /** Event when the filter has been cleared */
  @Output() filterCleared = new EventEmitter<void>();

  /** Flag that is true when the search pane should be shown */
  showSearchPane = false;

  /** String used to search over units */
  searchStr = '';

  /** Expose FilterPaneTranslationTokens to HTML */
  tokens: typeof FilterPaneTranslationTokens = FilterPaneTranslationTokens;

  constructor() { }


  /** OnInit */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activeFilter) {

      // Set search string
      if (!changes.activeFilter.previousValue && changes.activeFilter.currentValue) {
        this.searchStr = this.activeFilter.searchString;
      } else if (changes.activeFilter.previousValue.searchString !== changes.activeFilter.currentValue.searchString) {
        this.searchStr = this.activeFilter.searchString;
      }
    }
  }

  /**
   * Enables filter sync for this list
   */
  setEnableFilterSync(): void {
    this.enableFilterSync.next(!this.filterSyncEnabled);
  }

  /**
   * Clears the current search
   */
  clearSearch() {
      this.searchStr = '';
      this.search.emit(this.searchStr);
  }

  /**
   * Clears any active filters
   */
  clearFilters() {
    this.filterCleared.emit();
  }

  /**
   * Returns the number of filter operations currently being applied
   */
  filterOperationCount(): number {
    if (this.activeFilter && this.activeFilter.operations) {
      return this.activeFilter.operations.filter(item => {
        return item.operationString && item.operationString.trim() !== '';
      }).length;
    } else {
      return 0;
    }
  }

}

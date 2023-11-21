import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SortOptions$v1 } from '@galileo/platform_commonnotifications';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { FilterOptions$v1 } from '@galileo/web_commonnotifications/_common';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { NotificationStoreService } from '../../../../notification-store.service';
import { SortPaneTranslationTokens } from './sort-pane.translation';

@Component({
    selector: 'hxgn-commonnotifications-sort-pane',
    templateUrl: 'sort-pane.component.html',
    styleUrls: ['sort-pane.component.scss']
})
export class SortPaneComponent implements OnInit, OnDestroy {

    /** The number of notifications that are currently being shown */
    @Input() notificationCount = 0;

    /** Options that can be filtered on */
    @Input('filterOptions')
    set setFilterOptions(options: FilterOptions$v1) {
        this.filterOptions = [].concat(options);

        this.filterOptions.forEach(option => {
            if (!this.capabilityIds.find(id => id === option.capabilityId)) {
                this.capabilityIds.push(option.capabilityId);
            }
        });

        this.sortFilterOptions();

        this.notificationStore.filterOptions$.pipe(first()).toPromise().then(filter => {
            if (filter) {
                this.enabledNotifications = filter;
            } else {
                this.enabledNotifications = this.filterOptions.map(o => o.id);
            }
            this.filterChange.emit(this.enabledNotifications);
        });
    }

    /** Event the filters that are active */
    @Output() filterChange = new EventEmitter<string[]>();

    /** Event that the sort has changed */
    @Output() sortChange = new EventEmitter<SortOptions$v1>();

    /** Options that can be used to filter list */
    filterOptions: FilterOptions$v1[] = [];

    /** Items that are currently enable to be shown */
    enabledNotifications: string[] = [];

    /** The sort that is currently selected */
    selectedSort = SortOptions$v1.newestOnTop;

    /** Export SortOptions$v1 to HTML */
    sortOptions: typeof SortOptions$v1 = SortOptions$v1;

    /** Expose SortPaneTranslationTokens to HTML */
    tokens: typeof SortPaneTranslationTokens = SortPaneTranslationTokens;

    /** List of capability ids to group options by */
    capabilityIds: string[] = [];

    /** The capability id currently filtered on */
    selectedCapabilityId: string;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private notificationStore: NotificationStoreService,
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) { }

    async ngOnInit() {
        // Set the active sort
        this.notificationStore.sortOption$.pipe(first()).toPromise().then(sort => {
            if (sort) {
                this.setSort(sort);
            }
        });

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            await this.sortFilterOptions();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Returns true if the filter option is enabled
     * @param id Filter option id
     */
    isChecked(id: string): boolean {
        return !!this.enabledNotifications.find(typeId => typeId === id);
    }

    /**
     * Toggle all filters
     * @param event Angular mat checkbox change event
     */
    toggleAll(event: MatCheckboxChange): void {
        this.filterOptions.forEach(option => {
            this.toggleFilter(event, option.id);
        });
    }

    /**
     * Toggle filter
     * @param event Angular mat checkbox change event
     * @param id Filter id
     */
    toggleFilter(event: MatCheckboxChange, id: string): void {
        if (event.checked) {
            // Make sure its not in the list
            if (!this.enabledNotifications.find(fId => fId === id)) {
                this.enabledNotifications = this.enabledNotifications.concat([id]);
            }
        } else {
            this.enabledNotifications = this.enabledNotifications.filter(typeId => {
                return typeId !== id;
            });
        }

        this.filterChange.emit(this.enabledNotifications);
        this.notificationStore.setEnabledFilters(this.enabledNotifications);
    }

    /**
     * Toggle filters by capability
     */
    toggleCapabilityFilter(event: MatCheckboxChange, capabilityId): void {
        this.filterOptions.filter(option => option.capabilityId === capabilityId).forEach(option => {
            this.toggleFilter(event, option.id);
        });
    }

    /**
     * Returns true if all capability options are enabled
     * @param capabilityId capability id
     */
    isCapabilityChecked(capabilityId: string): boolean {
        const capabilityOptions = this.getFilterOptions(capabilityId);

        let foundCount = 0;
        for (const option of capabilityOptions) {
            if (this.enabledNotifications.find(id => id === option.id)) {
                foundCount++;
            }
        }

        return foundCount === capabilityOptions.length;
    }

    /**
     * Returns the capability token
     * @param capabilityId Capability id
     */
    getCapabilityToken(capabilityId: string): string {
        return this.getFilterOptions(capabilityId)[0].capabilityToken;
    }

    /**
     * Returns true if some but not all of the capability filters are on
     * @param capabilityId Capability id
     */
    isSomeCapabilityChecked(capabilityId: string): boolean {
        const capabilityOptions = this.getFilterOptions(capabilityId);

        let foundCount = 0;
        for (const option of capabilityOptions) {
            if (this.enabledNotifications.find(id => id === option.id)) {
                foundCount++;
            }
        }

        return foundCount !== capabilityOptions.length && foundCount > 0;
    }

    /**
     * Sets the active sort option
     * @param sort Sort option to make active
     */
    setSort(sort: SortOptions$v1): void {
        this.selectedSort = sort;
        this.sortChange.emit(sort);
        this.notificationStore.setSortOption(sort);
    }

    /**
     * Returns filter options by capability id
     */
    getFilterOptions(capabilityId: string) {
        return this.filterOptions.filter(option => {
            return option.capabilityId === capabilityId;
        });
    }

    /**
     * Sorts the filter list options
     */
    private async sortFilterOptions() {
        // Sort the filter options
        const mapTokenString = new Map<string, string>();
        const filterOptionsTokens = await this.localizationAdapter.getTranslationAsync(this.filterOptions.map(x => x.nameToken));
        for (const option of this.filterOptions) {
            mapTokenString.set(option.nameToken, filterOptionsTokens[option.nameToken]);
        }

        this.filterOptions.sort((a, b) => {
            if (mapTokenString.get(a.nameToken) < mapTokenString.get(b.nameToken)) {
                return -1;
            } else {
                return 1;
            }
        });
    }
}

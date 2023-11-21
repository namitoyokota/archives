import { Store$v1 } from '@galileo/platform_common-libraries';
import { BehaviorSubject } from 'rxjs';

import { AppNotification$v1 } from '../abstractions/app-notification.v1';
import { SortOptions$v1 } from '../abstractions/sort-options.v1';

export class NotificationStore$v1 extends Store$v1<AppNotification$v1<string, string>> {
    /** Bus for filter options that are enabled */
    private filterOptions = new BehaviorSubject<string[]>(null);

    /** Stream of filter options that are enabled */
    readonly filterOptions$ = this.filterOptions.asObservable();

    /** Bus for active sort option */
    private sortOption = new BehaviorSubject<SortOptions$v1>(SortOptions$v1.newestOnTop);

    /** Stream for sort option */
    readonly sortOption$ = this.sortOption.asObservable();

    /** The max number of notifications to keep in the store. */
    private readonly maxLimit = 250;

    constructor() {
        super('systemCorrelationId', AppNotification$v1);
    }

    /**
     * Update the store and checks for size limit
     * @param notification Object to upsert to list
     */
    upsert(notification: AppNotification$v1<string, string>): void {
        super.upsert(notification);

        // Remove oldest if size reached its limit
        const limitReached = this.entity.getValue()?.length > this.maxLimit;
        if (limitReached) {
            const updatedList = [...this.entity.getValue()];
            updatedList.shift();
            this.entity.next(updatedList);
        }
    }

    /**
     * Sets the enabled filters
     * @param filters Filters that are enabled
     */
    setEnabledFilters(filters: string[]): void {
        this.filterOptions.next(filters);
    }

    /**
     * Sets the active sort option
     * @param option Sort that is active
     */
    setSortOption(option: SortOptions$v1): void {
        this.sortOption.next(option);
    }
}

import { Directive, OnDestroy } from '@angular/core';
import { RestrictionGrouping$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommontenantAdapterService$v1 } from './commontenant-adapter.v1.service';

/**
 * Represents a filter criteria editor setting object.
 */
export interface FilterCriteriaEditorSettings {

    /**
     * List of filter criteria that cannot be changed. This is only used for edit overrides, and
     * will be populated with globals.
     */
    readOnlyFilterCriteria: RestrictionGrouping$v1<any, any>[];

    /**
     * List of redaction criteria that cannot be changed. This is only used for edit overrides and
     * will be populated with globals.
     */
    readOnlyRedactionCriteria: RestrictionGrouping$v1<any, any>[];

    /**
     * Flag that indicates if overrides are being edited
    */
    isOverride: boolean;

    /**
     * List of editable filter criteria. This could be global or overrides.
     */
    editableFilterCriteria: RestrictionGrouping$v1<any, any>[];

    /**
     * Observable that can notify the admin UI of filter settings
     */
    filterNotify$: Subject<RestrictionGrouping$v1<any, any>[]>;

    /**
     * List of editable redaction criteria. This could be global or overrides.
     */
    editableRedactionCriteria: RestrictionGrouping$v1<any, any>[];

    /**
     * Observable that can notify the admin UI of redaction settings
     */
    redactionNotify$: Subject<RestrictionGrouping$v1<any, any>[]>;
}

/**
 * Base class all filter criteria components that can be injected in the data sharing UI
 * should be derived from.
 */
@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class FilterCriteriaEditor implements OnDestroy {

    /**
     * Observable for component destroyed. Used to clean up subscriptions.
     */
    destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(public settings: FilterCriteriaEditorSettings,
        private adapter: CommontenantAdapterService$v1) {
        this.bootstrap();
    }

    /**
     * Event that is fired when the selected filter level changes
     * @param filterLevel The current filter level
     */
    onRestrictionLevelChange(filterLevel: string) {
        throw new Error('onRestrictionLevelChange() - Is not implemented');
    }

    /**
     * Emits the current filter and redaction criteria
     */
    emit() {
        this.settings.filterNotify$.next(this.settings.editableFilterCriteria);
        this.settings.redactionNotify$.next(this.settings.editableRedactionCriteria);
    }

    /**
     *  Life cycle hook for on destroy. Will clean up subscriptions.
     */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * Set up listeners to required events.
     */
    private bootstrap(): void {
        this.adapter.notifications.onAdminDataFilterLevelChange$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((level) => {
            this.onRestrictionLevelChange(level);
        });
    }

}

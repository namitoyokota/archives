import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Guid, Utils } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    CapabilityManifest$v1,
    RestrictionLevels$v1,
    SharingConfiguration$v2,
    SharingCriteria$v1,
} from '@galileo/web_commontenant/_common';
import { CoreService } from '@galileo/web_commontenant/app/_core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActiveDataFiltersTranslationTokens } from './active-data-filters.translation';
import { ActiveFilterItemComponent } from './active-filter-item/active-filter-item.component';
import { EditOverrideDialogComponent } from './edit-override-dialog/edit-override-dialog.component';

@Component({
    selector: 'hxgn-commontenant-admin-active-data-filters',
    templateUrl: 'active-data-filters.component.html',
    styleUrls: ['active-data-filters.component.scss']
})
export class ActiveDataFiltersComponent implements OnInit, OnDestroy {

    /** List of global sharing criteria */
    @Input() globalSharingCriteria: SharingCriteria$v1<any, any>[] = [];

    /** Sharing configuration input. */
    @Input() sharingConfiguration: SharingConfiguration$v2;

    /** Event when criteria has been updated */
    @Output() updateCriteria = new EventEmitter<SharingCriteria$v1<any, any>>();

    /** List of filter items */
    @ViewChildren('fi') filterItems: QueryList<ActiveFilterItemComponent>;

    /** Mapping of capability id to portal host id */
    capabilityPortalHostIdMap: Map<string, string>;

    /** Expose tokens to the html */
    tokens: typeof ActiveDataFiltersTranslationTokens = ActiveDataFiltersTranslationTokens;

    /** List of capability names to translate */
    private capabilityNameTokens: string[] = [];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private coreSrv: CoreService,
        private dialog: MatDialog,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        const capabilities = this.coreSrv.getCapabilityList();
        this.capabilityNameTokens = capabilities.map(x => x.nameToken);
        this.localizationSrv.localizeStringsAsync(this.capabilityNameTokens);

        this.capabilityPortalHostIdMap = new Map<string, string>();
        for (const sharing of this.globalSharingCriteria) {
            this.capabilityPortalHostIdMap.set(sharing.capabilityId, Guid.NewGuid());
        }

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.localizationSrv.localizeStringsAsync(this.capabilityNameTokens);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }


    /**
    * Return the capability that matches the provided capability id.
    * @param capabilityId The capability to get
    */
    getCapability(capabilityId: string): CapabilityManifest$v1 {
        return this.coreSrv.getCapability(capabilityId);
    }

    /**
     * Returns true if the capability has active filter and redaction overrides.
     * Overrides to the current level are ignored
     * @param capabilityId The capability to check
     */
    hasActiveFilterOverrides(capabilityId: string): boolean {
        const override = this.getOverride(capabilityId);
        if (!override?.filterOperations?.length && !override?.redactionOperations?.length) {
            return false;
        } else {
            let hasFilters = false;
            let hasRedactions = false;

            if (override.filterOperations.length) {
                hasFilters = !!override.filterOperations.find(item => item.restrictions.length > 0);
            }

            if (override.redactionOperations.length) {
                hasRedactions = !!override.redactionOperations.find(item => item.restrictions.length > 0);
            }

            return hasFilters || hasRedactions;
        }
    }

    /**
     * Return the sharing criteria overrides for a capability
     * @param capabilityId The capability to get override document for
     */
    getOverride(capabilityId: string): SharingCriteria$v1<any, any> {
        return this.sharingConfiguration.criteria.find(item => {
            return item.capabilityId === capabilityId;
        });
    }

    /**
   * Returns the currently active restriction level. This could be the
   * global or override level.
   * @param capabilityId The capability id
   */
    getCurrentRestrictionLevel(capabilityId: string): string {
        // First check for an override
        const override = this.sharingConfiguration.criteria.find(c => c.capabilityId === capabilityId);
        if (override?.currentLevel) {
            return override.currentLevel;
        }

        // Get global
        const global = this.globalSharingCriteria.find(c => c.capabilityId === capabilityId);
        if (global?.currentLevel) {
            return global.currentLevel;
        }

        return '';
    }

    /**
     * Set the override restriction level.
     * @param level The new restriction level
     * @param capabilityId The capability the restriction level is for.
     */
    setOverrideLevel(level: RestrictionLevels$v1, capabilityId: string) {
        const global = this.globalSharingCriteria.find(c => c.capabilityId === capabilityId)?.currentLevel;

        const update = new SharingCriteria$v1<any, any>(this.getOverride(capabilityId));
        update.currentLevel = global === level ? null : level;
        this.updateCriteria.emit(update);

        // Update injected item
        const item = this.filterItems.toArray().find(fi => fi.capabilityId === capabilityId);
        if (item) {
            // wait for next angular tick
            setTimeout(() => {
                item.inject();
            });
        }
    }

    /**
     * Gets injection setting for a given capability
     * @param capabilityId Capability id to get settings for
     */
    getInjectionSettings(capabilityId: string): any {
        const global = this.globalSharingCriteria.find(item => {
            return item.capabilityId === capabilityId;
        });

        const overrides = this.sharingConfiguration.criteria.find(item => {
            return item.capabilityId === capabilityId;
        });

        const settings = {
            globalFilters: global.filterOperations,
            globalRedaction: global.redactionOperations,
            overriddenFilters: overrides.filterOperations,
            overriddenRedaction: overrides.redactionOperations,
            currentLevel: this.getCurrentRestrictionLevel(capabilityId)
        };

        return settings;
    }

    /** Opens edit override dialog. */
    openEditOverrideDialog(config: SharingConfiguration$v2, capabilityId: string, event: MouseEvent) {
        event.stopPropagation();

        // Filter config to just the data the dialog cares about
        const edit = new SharingConfiguration$v2(Utils.deepCopy(config));
        edit.criteria = edit.criteria.filter(c => c.capabilityId === capabilityId);

        const data = {
            config: edit,
            capability: this.coreSrv.getCapability(capabilityId),
            selectedLevel: this.getCurrentRestrictionLevel(capabilityId),
            global: new SharingCriteria$v1<any, any>(this.getGlobalFilters(capabilityId))
        };
        const dialogRef = this.dialog.open(EditOverrideDialogComponent, {
            disableClose: true,
            autoFocus: false,
            data: data
        }).afterClosed().subscribe(update => {
            if (update) {
                this.updateCriteria.emit(update);

                const item = this.filterItems.toArray().find(fi => fi.capabilityId === capabilityId);
                if (item) {
                    // wait for next angular tick
                    setTimeout(() => {
                        item.inject();
                    });
                }
            }
        });
    }

    /**
     * Gets the global settings for a given capability
     * @param capabilityId The capability id to get globals for
     */
    getGlobalFilters(capabilityId) {
        return this.globalSharingCriteria.find(c => c.capabilityId === capabilityId);
    }
}

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PanelState } from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    AppNotification$v1,
    capabilityId,
    CapabilitySettings$v1,
    FilterOptions$v1,
} from '@galileo/web_commonnotifications/_common';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EventService } from '../../../event.service';
import { SettingsStoreService } from '../../../settings-store.service';
import { FullNotificationPaneTranslationTokens } from './full-notification-pane.translation';
import { SortOptions$v1 } from '@galileo/platform_commonnotifications';

@Component({
    selector: 'hxgn-commonnotifications-full-pane',
    templateUrl: 'full-notification-pane.component.html',
    styleUrls: ['full-notification-pane.component.scss']
})
export class FullNotificationPaneComponent implements OnInit, OnDestroy {

    /** List of notifications to show */
    @Input('appNotifications')
    set setAppNotifications(appNotifications: AppNotification$v1<string, string>[]) {
        this.applyFilter(appNotifications);
    }

    /** Id of context */
    @Input() contextId: string;

    /** Event that the notification has been updated */
    @Output() notificationsUpdated = new EventEmitter<AppNotification$v1<string, string>[]>();

    /** Event that a notification has been cleared */
    @Output() clear = new EventEmitter<string[]>();

    /** Capability ids to put notifications into groups */
    capabilityIds: string[] = [];

    /** Mapping of capability id to name token */
    optionsIdMapping = new Map<string, CapabilitySettings$v1>();

    /** Group notifications by capability ids */
    groups = new Map<string, AppNotification$v1<string, string>[]>();

    /** Total number of notifications */
    totalCount = 0;

    /** Total number of notifications that pass the filters */
    filterCount = 0;

    /** List of filter options */
    filterOptionList: FilterOptions$v1[] = [];

    /** Filters that are enabled */
    activeFilter: string[] = [];

    /** Sort that is active */
    activeSort: SortOptions$v1 = SortOptions$v1.newestOnTop;

    /** Expose FullNotificationPaneTranslationTokens to HTML */
    tokens: typeof FullNotificationPaneTranslationTokens = FullNotificationPaneTranslationTokens;

    /** True when the settings pane should be shown */
    showSettingsPane = false;

    /** The order the groups should be displayed in */
    groupOrder: string[] = [];

    /** Flag that is true when groups are done loading */
    loadingComplete = false;

    /** What sections are expanded */
    sectionState = new Map<string, PanelState>();

    /** Key used to save settings */
    private readonly settingsKey = 'NOTIFICATION_CATEGORY_ORDER';

    // Full list of notifications
    private fullNotifications: AppNotification$v1<string, string>[] = [];

    // List of capability setting token name
    private tokenList: string[] = [];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private eventSrv: EventService,
        private tenantAdapter: CommontenantAdapterService$v1,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private identityAdapter: CommonidentityAdapterService$v1,
        public settings: SettingsStoreService,
        private ffAdapter: CommonfeatureflagsAdapterService$v1
    ) { }

    /**
     * On init life cycle hook
     */
    async ngOnInit(): Promise<void> {
        /** Set the capability id's that support notifications */
        const supportedList = (await this.tenantAdapter.getCapabilityListAsync(capabilityId))?.filter(manifest => {
            // Check for feature flags
            const settings = manifest.compatible.find(c => c.capabilityId === capabilityId)?.options as CapabilitySettings$v1;
            if (settings?.featureFlag && !this.ffAdapter.isActive(settings.featureFlag)){
                return false;
            }

            return true;
        });
        this.tokenList = [];

        // Add flag group
        this.capabilityIds.push(capabilityId);
        this.optionsIdMapping.set(capabilityId, {
            nameToken: FullNotificationPaneTranslationTokens.flagged,
            filterOptions: [],
            iconPath: null
        } as CapabilitySettings$v1);

        supportedList.forEach(capability => {
            this.capabilityIds.push(capability.id);

            const options: CapabilitySettings$v1 = capability.compatible
                .find(option => option.capabilityId === capabilityId).options as CapabilitySettings$v1;
            this.optionsIdMapping.set(capability.id, options);
            this.tokenList.push(options.nameToken);
        });

        this.filterOptionList = this.filterOptions();

        // Sort it by the order that is saved
        this.identityAdapter.getUserInfoAsync().then(async user => {
            this.groupOrder = await this.identityAdapter.getUserPersonalizationSettingsAsync<string[]>(user.id, this.settingsKey);
            this.sortGroup(this.groupOrder);
            this.loadingComplete = true;
        }).catch(err => {
            this.loadingComplete = true;
        });

        this.initLocalization();

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    private initLocalization() {
        this.localizationAdapter.localizeStringsAsync(this.tokenList);
        this.localizationAdapter.localizeStringsAsync(this.filterOptionList.map(o => o.nameToken));
    }

    /**
     * Filter list of notifications
     * @param id List of notifications to show
     */
    setFilter(id: string[]): void {
        this.activeFilter = id;
        this.applyFilter(this.fullNotifications);
    }

    /**
     * Event that is fired when groups need to be reordered
     */
    reorder(order: string[]): void {
        this.loadingComplete = false;
        this.groupOrder = [].concat(order);
        this.sortGroup(this.groupOrder);

        setTimeout(() => { this.loadingComplete = true; });
    }

    /**
     * Sets the active sort option
     * @param sort The sort option to apply
     */
    setSort(sort: SortOptions$v1): void {
        this.activeSort = sort;
        this.applyFilter(this.fullNotifications);
    }

    /**
     * Close the notification panel
     */
    close() {
        this.eventSrv.showPanel(false);
    }

    /**
     * Clears a notification
     * @param ids Notification id
     */
    clearNotification(ids: string[]): void {
        this.clear.emit(ids);
    }

    /**
     * Clears all of the notifications
     * @param id capability id
     */
    clearAll(id: string): void {
        const clearIds = this.groups.get(id).map(n => n.systemCorrelationId);

        this.clear.emit(clearIds);
    }

    /**
     * Set the state of the section
     */
    setIsExpanded(id: string, state: PanelState): void {
        this.sectionState.set(id, state);
    }

    private sortGroup(groupOrder: string[]): void {
        if (!groupOrder?.length) {
            return;
        }

        this.capabilityIds.sort((a, b) => {
            return this.groupOrder?.indexOf(a) - this.groupOrder?.indexOf(b);
        });
    }

    /**
     * Tracks an item in a ngFor loop
     */
    trackByFn(index, n: AppNotification$v1<string, string>) {
        return n.systemCorrelationId;
    }

    /**
     * Return list of filter options
     */
    private filterOptions(): FilterOptions$v1[] {
        let filterOptions: FilterOptions$v1[] = [];

        this.optionsIdMapping.forEach((option, cId) => {
            filterOptions = filterOptions.concat(option.filterOptions.map(fOption => {
                fOption.capabilityId = cId;
                fOption.capabilityToken = this.optionsIdMapping.get(cId).nameToken;
                return fOption;
            }));
        });

        return filterOptions;
    }

    private applySort(appNotifications: AppNotification$v1<string, string>[]): AppNotification$v1<string, string>[] {
        return appNotifications.sort((a, b) => {
            switch (this.activeSort) {
                case SortOptions$v1.newestOnTop:
                    if (a.timestamp > b.timestamp) {
                        return -1;
                    } else {
                        return 1;
                    }
                case SortOptions$v1.oldestOnTop:
                    if (a.timestamp < b.timestamp) {
                        return -1;
                    } else {
                        return 1;
                    }
                case SortOptions$v1.displayOrderAsc:
                    if (a.uiSettings.displayOrder < b.uiSettings.displayOrder) {
                        return -1;
                    } else if (a.uiSettings.displayOrder > b.uiSettings.displayOrder) {
                        return 1;
                    } else {
                        return 0;
                    }
                case SortOptions$v1.displayOrderDesc:
                    if (a.uiSettings.displayOrder > b.uiSettings.displayOrder) {
                        return -1;
                    } else if (a.uiSettings.displayOrder < b.uiSettings.displayOrder) {
                        return 1;
                    } else {
                        return 0;
                    }
            }
        });
    }

    /**
     * Applies a filter to a list of app notifications
     * @param appNotifications List of app notifications to apply filter to
     */
    private applyFilter(appNotifications: AppNotification$v1<string, string>[]): void {

        this.totalCount = appNotifications?.length;
        this.fullNotifications = appNotifications;

        let filterList = [].concat(appNotifications);
        filterList = filterList.filter(n => {
            return !!this.activeFilter.find(f => f === n.notificationType);
        });

        this.filterCount = filterList?.length;

        // Apply sort
        filterList = this.applySort(filterList);

        const updatedGroups = new Map<string, AppNotification$v1<string, string>[]>();

        // Add flag notification
        updatedGroups.set(capabilityId, []);

        // Sort each notification into a group
        filterList?.forEach(n => {

            if (n.flagged) {
                const list = updatedGroups.get(capabilityId);
                const hasItem = !!list.find(an => an.systemCorrelationId === n.systemCorrelationId);

                if (!hasItem) {
                    // Add item
                    updatedGroups.set(capabilityId, [...list, n]);
                }
            } else if (updatedGroups.has(n.capabilityId)) {
                // Check if notification is in the group
                const list = updatedGroups.get(n.capabilityId);
                const hasItem = !!list.find(an => an.systemCorrelationId === n.systemCorrelationId);

                if (!hasItem) {
                    // Add item
                    updatedGroups.set(n.capabilityId, [...list, n]);
                }

            } else {
                updatedGroups.set(n.capabilityId, [n]);
            }

        });

        this.groups = updatedGroups;
    }
}

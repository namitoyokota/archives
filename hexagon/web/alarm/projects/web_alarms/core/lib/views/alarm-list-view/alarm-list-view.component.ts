import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    HostBinding,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    Alarm$v1,
    AlarmFilter$v1,
    capabilityId,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
    RestrictIds$v1,
} from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { LayoutCompilerAdapterService, View$v1 } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CommontenantAdapterService$v1, Tenant$v1, TenantSelectionComponent } from '@galileo/web_commontenant/adapter';
import { ShapeFilter$v1, ShapesAdapterService$v1 } from '@galileo/web_shapes/adapter';
import { BehaviorSubject, combineLatest, from, Observable, Subject } from 'rxjs';
import { filter, first, map, mergeMap, takeUntil } from 'rxjs/operators';

import { ActionStoreService } from '../../action-store.service';
import { Actions$v1 } from '../../actions.v1';
import { CountInjectableComponent } from '../../injectable-components/count/count.component';
import { SortOptions } from '../../shared/sorting/sort-options';
import { AlarmListSettings } from './alarm-list-view-settings';
import { AlarmListTranslatedTokens, AlarmListTranslationTokens } from './alarm-list-view.translation';

class AlarmListPersonalization$v1 {
    /** Saved filter */
    alarmFilter?: AlarmFilter$v1;

    /** Saved sort by option */
    sortBy?: SortOptions;

    constructor(params: AlarmListPersonalization$v1 = {} as AlarmListPersonalization$v1) {
        const {
            alarmFilter = null,
            sortBy = null
        } = params;

        this.alarmFilter = alarmFilter;
        this.sortBy = sortBy;
    }
}

@Component({
    templateUrl: 'alarm-list-view.component.html',
    styleUrls: ['alarm-list-view.component.scss'],
    animations: [
        trigger('expansionState', [
            state(':enter', style({ height: '*' })),
            state(':leave', style({ height: '0' })),
            state('void', style({ height: '0' })),
            transition('* => *', animate('300ms ease-in-out'))
        ])
    ]
})
export class AlarmListViewComponent implements OnInit, AfterViewInit, OnDestroy {

    /** Reference to the cdk scroll viewport */
    @ViewChild(CdkVirtualScrollViewport, { static: false }) viewport: CdkVirtualScrollViewport;

    /** Reference to tenant selection */
    @ViewChild(TenantSelectionComponent) tenantSelection: TenantSelectionComponent;

    /** Card that is expanded */
    expandedCardId: string;

    /** The last incident card to be expanded */
    lastExpandedCardId: string;

    /** The current user's tenant id */
    tenantId: string;

    /** Size of expanded card */
    expandSize$ = new BehaviorSubject<number>(0);

    /** Flag that when true will show the tenant info on alarm card */
    showTenantInfo = false;

    /** Sort that is currently being applied */
    activeSort$ = new BehaviorSubject<SortOptions>(null);

    /** Filter being applied to the list */
    activeFilter$ = new BehaviorSubject<AlarmFilter$v1>(new AlarmFilter$v1());

    /** Flag that is true when the filter sync is enabled */
    filterSyncEnabled = false;

    /** List of tenant Id that is sharing alarm data */
    shareTenantIds: string[] = [];

    /** State of the button */
    paneState$: Observable<boolean>;

    /** Current shape filter */
    private shapeFilter$ = new BehaviorSubject<ShapeFilter$v1>(null);

    /** List of filter alarms */
    filteredAlarms$: Observable<Alarm$v1[]> = combineLatest([
        this.alarmStore.entity$.pipe(map((alarms: Alarm$v1[]) => {
            // Don't show tombstoned alarms
            return alarms.filter(alarm => !alarm.tombstoned);
        })),
        this.activeFilter$,
        this.activeSort$,
        this.shapeFilter$
    ]).pipe(
        map(([list, filters, sort, shapeFilter]) => {
            let filterList = [];

            // Filter based on filter object
            if (filters) {
                filterList = filters.apply(list);
            }

            // Apply shape filter
            if (shapeFilter?.coordinates) {
                filterList = filterList.filter((alarm: Alarm$v1) => {
                    if (!alarm?.location?.coordinates?.latitude ||
                        !alarm?.location?.coordinates?.longitude) {
                        return false;
                    }

                    const point = [+alarm.location.coordinates.longitude, +alarm.location.coordinates.latitude];
                    return this.shapeAdapter.isPointInGeometry(shapeFilter, point);
                });
            }

            return filterList;
        }),
        map(list => {
            this.sortList(list);
            return list;
        })
    );

    /** Height of the cards */
    itemHeights$ = combineLatest([
        this.filteredAlarms$,
        this.expandSize$
    ]).pipe(
        map(([list, size]) => {
            return list.map((i) => {
                if (i.id === this.expandedCardId && size) {
                    return size;
                } else {
                    const base = 71;
                    const baseWithTenant = 89;


                    if (this.showTenantInfo) {
                        return baseWithTenant;
                    } else {
                        return base;
                    }
                }
            });
        })
    );

    /** List of views linked to this view */
    linkedViews$: Observable<View$v1[]>;

    /** The alarm that is selected */
    selectedAlarmId$: Observable<string>;

    /** The alarms that are selected */
    selectedAlarmIds$: Observable<string[]>;

    /** The last alarm to have been selected */
    lastSelectedId: string;

    /** Expose AlarmListTranslationTokens to HTML */
    tokens: typeof AlarmListTranslationTokens = AlarmListTranslationTokens;

    /** Translated tokens list. */
    tTokens: AlarmListTranslatedTokens = {} as AlarmListTranslatedTokens;

    /** Flag that is true if the view needs to show its own header */
    @HostBinding('class.show-header') showHeader = false;

    private filterSettingsKey: string;

    /** Subject used unsubscribe to all subject on destroy of component */
    private destroy$ = new Subject<boolean>();

    /** Reference to the custom header component */
    private customHeaderRef: ComponentRef<CountInjectableComponent>;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public settings: AlarmListSettings,
        private alarmStore: StoreService<Alarm$v1>,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private actionStore: ActionStoreService,
        private layoutAdapter: LayoutCompilerAdapterService,
        private tenantSrv: CommontenantAdapterService$v1,
        private identitySrv: CommonidentityAdapterService$v1,
        private cdr: ChangeDetectorRef,
        private ffAdapter: CommonfeatureflagsAdapterService$v1,
        private shapeAdapter: ShapesAdapterService$v1) {

        this.showHeader = !this.settings.enablePortalFormatting;
        this.filterSettingsKey = 'alarmListSettings-' + this.settings.contextId;
        this.paneState$ = from(this.layoutAdapter.getOptionPaneStateAsync(this.settings.contextId)).pipe(
            mergeMap(bus => bus)
        );
        this.linkedViews$ = from(this.layoutAdapter.getLinkedViewsAsync<Actions$v1>(this.settings.contextId, Actions$v1.filterSync));

        this.selectedAlarmIds$ = this.actionStore.multiselect$(this.settings.contextId).pipe(
            map(data => data?.items?.map(item => item.entityId))
        );
    }

    /**
     * On init life cycle hook
     */
    async ngOnInit() {
        this.initLocalization();
        this.tenantId = (await this.identitySrv.getUserInfoAsync()).activeTenant;
        this.shareTenantIds = (await this.getTenantIdList()).concat([this.tenantId]);

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.initLocalization();
            }
        });
    }

    /**
     * After view init life cycle hooke
     */
    ngAfterViewInit(): void {
        this.listenToSelection();
        this.listenToFilterAction();
        this.listenToFilterSync();
        this.createCustomHeaderAsync();

        this.actionStore.shapeFilter$(this.settings.contextId).pipe(
            takeUntil(this.destroy$)
        ).subscribe(sf => {
            this.shapeFilter$.next(sf);
        });
    }

    /**
     * On destroy life cycle hook
     */
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();

        if (this.customHeaderRef) {
            this.customHeaderRef.destroy();
            this.customHeaderRef = null;
        }
    }

    /**
     * Sets the size of the card
     * @param size Sets the size of the card
     */
    setSize(size: number) {
        this.expandSize$.next(size);

        // Size is updated in a child component after change detection
        // has run. Need to let angular know about the change.
        this.cdr.detectChanges();
    }

    /**
     * Function used by a ngFor loop in the html to
     * help with performance.
     * @param index Item's index in list
     * @param item  Alarm
     */
    trackByFn(index, item: Alarm$v1) {
        return item.id;
    }

    /**
     * Sets the selected tenants based on what is set in the tenant selector.
     * @param tenants The selected tenants
     */
    async setSelectedTenants(tenants: Tenant$v1[]) {
        this.showTenantInfo = tenants.length > 1;
        const activeTenants = this.activeFilter$.getValue().tenants.length;

        if (!activeTenants) {
            await this.loadFilterFromStoreAsync();
        }

        const updateFilter = new AlarmFilter$v1(this.activeFilter$.getValue());
        updateFilter.tenants = [].concat(tenants.map(tenant => tenant.id));
        this.setActiveFilter(updateFilter);
    }

    /**
     * Sets the active filter
     * @param activeFilter Filter to apply
     * @param saveSettings A flag that is true if settings should be saved to database
     */
    setActiveFilter(activeFilter: AlarmFilter$v1, saveSettings = true) {
        const appliedFilter = new AlarmFilter$v1(activeFilter);
        this.activeFilter$.next(appliedFilter);

        // Only trigger filter action if sync is enabled
        if (this.filterSyncEnabled) {
            this.actionStore.filter(this.settings.contextId, activeFilter);
        }

        if (saveSettings) {
            this.storeCurrentSettingsAsync();
        }
    }

    /**
     * Enables filter sync for this list
     */
    enableFilterSync(isEnabled: boolean): void {
        if (isEnabled) {
            this.actionStore.filterSync(this.settings.contextId);
        } else {
            this.filterSyncEnabled = false;
            this.actionStore.filter(this.settings.contextId, null);
        }
    }

    /**
     * Sets the expanded state for alarm card.
     * @param isExpanded Is the card details expanded
     * @param id alarm id
     */
    setExpansionCardState(isExpanded: boolean, id: string, index?: number) {
        const expandLength = 350; // How long the expand animation last.
        const scrollLength = 500; // How long the scroll animation last

        if (isExpanded) {
            this.lastExpandedCardId = id;
            this.expandedCardId = this.lastExpandedCardId;
        
            // Wait for animation to be done
            setTimeout(() => {
                this.viewport.scrollToIndex(index, 'smooth');

                // Wait for animation to be done
                setTimeout(() => {
                    this.expandedCardId = this.lastExpandedCardId;
                }, scrollLength);
            }, expandLength);
         
        } else {
            this.expandedCardId = null;
            this.expandSize$.next(0);
            this.lastExpandedCardId = null;

            // Size is updated in a child component after change detection
            // has run. Need to let angular know about the change.
            this.cdr.detectChanges();
        }
    }

    /**
     * Detail panel was destroyed when scrolling away
     */
    detailsDestroy(): void {

        // Wait for the next microtask to update
        Promise.resolve().then(() => {
            this.expandedCardId = null;
            this.setSize(0);
        });
    }

    /**
     * Close the option pane
     */
    openPane() {
        this.layoutAdapter.openOptionPane(this.settings.contextId);
    }

    /**
     * Open the option pane
     */
    closePane() {
        this.layoutAdapter.closeOptionPane(this.settings.contextId);
    }

    /**
     * Clears any active filters
     */
    clearFilters() {
        const updatedFilters = new AlarmFilter$v1(this.activeFilter$.getValue());
        updatedFilters.operations = [];
        this.setActiveFilter(updatedFilters);
        this.storeCurrentSettingsAsync();
    }

    /**
     * Sets the search string on the filter
     */
    searchAlarms(searchStr: string) {
        const updatedFilters = new AlarmFilter$v1(this.activeFilter$.getValue());
        updatedFilters.searchString = searchStr.toLocaleLowerCase().trim();

        this.setActiveFilter(updatedFilters);
        this.storeCurrentSettingsAsync();
    }

    /**
     * Sets the sort option
     */
    setSort(sortOption: SortOptions) {
        this.activeSort$.next(sortOption);
    }

    /**
     * Resets the settings to the default
     */
    async resetFiltersSettingsAsync() {
        const defaultFilter = new AlarmFilter$v1(this.settings.filter);
        defaultFilter.tenants = this.activeFilter$.getValue().tenants;

        this.activeFilter$.next(defaultFilter);
        this.activeSort$.next(this.settings.sortBy);
        this.setActiveFilter(defaultFilter, false);

        await this.identitySrv.deleteUserPersonalizationAsync(
            (await this.identitySrv.getUserInfoAsync()).id,
            this.filterSettingsKey
        );
    }

    /**
     * Returns true if the current filter is not the same as the default filter
     */
    hasFilterChanged(): boolean {
        const currentFilter = new AlarmFilter$v1(this.activeFilter$.getValue());
        const defaultFilter = new AlarmFilter$v1(this.settings.filter);

        // Don't look tenant ids
        currentFilter.tenants = [];
        defaultFilter.tenants = [];

        const currentFilterStr = JSON.stringify(currentFilter).toLocaleLowerCase();
        const defaultFilterStr = JSON.stringify(defaultFilter).toLocaleLowerCase();

        return currentFilterStr !== defaultFilterStr;
    }

    /**
     * Returns true if the current sort is not the same as the default sort
     */
    hasSortChanged(): boolean {
        return this.settings.sortBy !== this.activeSort$.getValue();
    }

    /**
     * Set the alarm that is selected
     */
    setSelection(id: string) {
        if (!this.settings.contextId) {
            return;
        }

        this.selectedAlarmId$.pipe(first()).subscribe(selectedId => {
            if (selectedId === id) {
                this.actionStore.select(this.settings.contextId, null);
            } else {
                this.actionStore.select(this.settings.contextId, id);
            }
        });
    }

    /**
     * Set the alarm Ids that should be selected
     * @param id Alarm id clicked on
     */
    setSelections(id: string, event: MouseEvent) {

        combineLatest([
            this.selectedAlarmIds$.pipe(first()),
            this.filteredAlarms$.pipe(first())
        ]).pipe(first()).subscribe(([ids, alarms]) => {
            let anchorIndex = 0;
            if (this.lastSelectedId) {
                const index = alarms.findIndex(a => a.id === this.lastSelectedId);
                anchorIndex = index > -1 ? index : 0;
            } else {
                anchorIndex = 0;
            }

            const targetIndex = alarms.findIndex(a => a.id === id);

            this.updateSelection(event, ids, id, anchorIndex, targetIndex, alarms.map(a => a.id));
        });
    }

    /**
     * Updates the selected list based on the event
     * @param event Mouse event
     * @param current Current selection
     * @param targetId Target clicked on
     * @param anchorIndex Index of item to use as selection anchor
     * @param targetIndex Index of item clicked on
     * @param alarmIds Full list of alarm ids selecting from
     */
    private updateSelection(
        event: MouseEvent,
        current: string[],
        targetId: string,
        anchorIndex: number,
        targetIndex: number,
        alarmIds: string[]) {

        let update: string[] = [];
        if (event?.shiftKey && event?.ctrlKey) {
            // Shift ctrl click. This is only an additive operation
            if (targetIndex < anchorIndex) {
                update = alarmIds.slice(targetIndex, anchorIndex + 1);
            } else {
                update = alarmIds.slice(anchorIndex, targetIndex + 1);
            }

            // Add to list and remove dups
            update = [...new Set([...update].concat(current?.length ? current : []))];
            this.actionStore.multiselect(this.settings.contextId, [...update], true);
        } else if (event?.ctrlKey) {
            // Ctrl Click
            if (current?.some(id => id === targetId)) {
                // Unselect
                update = current.filter(id => id !== targetId);
                this.actionStore.multiselect(this.settings.contextId, update.length ? [...update] : null, true);
            } else {
                update = current ? current : [];
                this.actionStore.multiselect(this.settings.contextId, [...update, targetId], true);
            }
            this.lastSelectedId = targetId;
        } else if (event?.shiftKey) {
            // Shift click
            if (targetIndex !== anchorIndex) {
                if (targetIndex < anchorIndex) {
                    update = alarmIds.slice(targetIndex, anchorIndex + 1);
                } else {
                    update = alarmIds.slice(anchorIndex, targetIndex + 1);
                }

                this.actionStore.multiselect(this.settings.contextId, [...update], true);
            }
        } else {
            // Normal click
            if (current?.some(id => id === targetId) && current?.length === 1) {
                this.actionStore.multiselect(this.settings.contextId, null, false);
                this.lastSelectedId = null;
            } else {
                this.actionStore.multiselect(this.settings.contextId, [targetId], false);
                this.lastSelectedId = targetId;
            }
        }

    }

    /**
     * Injects a custom header component into the custom header portal.
     * This portal could be one of 3 places:
     *      1. Layout manager header
     *      2. Header of this component
     *      3. Tab space tab header
     */
    private async createCustomHeaderAsync() {
        this.customHeaderRef = await this.layoutAdapter.delegateInjectComponentPortalAsync(
            InjectableComponentNames.countComponent,
            capabilityId,
            `#${this.settings.customHeaderId}`,
            this.filteredAlarms$
        );
    }

    /**
     * Stores the current personalization settings
     */
    private async storeCurrentSettingsAsync() {
        this.identitySrv.saveUserPersonalizationSettingsAsync<AlarmListPersonalization$v1>(
            (await this.identitySrv.getUserInfoAsync()).id,
            this.filterSettingsKey,
            new AlarmListPersonalization$v1({
                alarmFilter: !this.hasFilterChanged() ? null : this.activeFilter$.getValue(),
                sortBy: !this.hasSortChanged() ? null : this.activeSort$.getValue()
            })
        );
    }

    /**
     * Sort the filter list of alarms based on view settings
     */
    private sortList(list: Alarm$v1[]): void {
        switch (this.activeSort$.getValue()) {
            case SortOptions.timeDesc:
                list.sort((a, b) => {
                    return (a.lastUpdateTime > b.lastUpdateTime) ? 1 : -1;
                });
                break;
            case SortOptions.timeAsc:
                list.sort((a, b) => {
                    return (a.lastUpdateTime < b.lastUpdateTime) ? 1 : -1;
                });
                break;
            case SortOptions.titleAsc:
                list.sort((a, b) => {
                    return (a.title.toLocaleLowerCase() > b.title.toLocaleLowerCase()) ? 1 : -1;
                });
                break;
            case SortOptions.titleDesc:
                list.sort((a, b) => {
                    return (a.title.toLocaleLowerCase() < b.title.toLocaleLowerCase()) ? 1 : -1;
                });
                break;
            case SortOptions.priorityDesc:
                list.sort((a, b) => {
                    const pA = a.isRedacted(RestrictIds$v1.priority) ? 999999 : a.priority;
                    const pB = b.isRedacted(RestrictIds$v1.priority) ? 999999 : b.priority;

                    return (pA > pB) ? 1 : -1;
                });
                break;
            case SortOptions.priorityAsc:
                list.sort((a, b) => {
                    const pA = a.isRedacted(RestrictIds$v1.priority) ? -1 : a.priority;
                    const pB = b.isRedacted(RestrictIds$v1.priority) ? -1 : b.priority;

                    return (pA < pB) ? 1 : -1;
                });
                break;
        }
    }

    private async loadFilterFromStoreAsync() {
        // Load any filters that are currently saved
        const storedFilter = await this.identitySrv.getUserPersonalizationSettingsAsync<AlarmListPersonalization$v1>(
            (await this.identitySrv.getUserInfoAsync()).id,
            this.filterSettingsKey
        );

        if (storedFilter?.alarmFilter) {

            // Updated the tenants on the filter
            const pendingFilter = new AlarmFilter$v1(storedFilter?.alarmFilter);
            pendingFilter.tenants = this.shareTenantIds;

            this.activeFilter$.next(pendingFilter);

            // Set the selected tenant
            if (this.tenantSelection) {
                this.tenantSelection.setSelectedTenants(pendingFilter.tenants);
            }
        } else if (this.settings.filter) {

            // Updated the tenants on the filter
            const pendingFilter = new AlarmFilter$v1(this.settings.filter);
            pendingFilter.tenants = this.shareTenantIds;

            this.activeFilter$.next(pendingFilter);
        }

        if (storedFilter?.sortBy) {
            this.activeSort$.next(storedFilter?.sortBy);
        } else if (this.settings.sortBy) {
            this.activeSort$.next(this.settings.sortBy);
        }
    }

    /**
     * Get a list of all tenants that is sharing alarms
     */
    private async getTenantIdList() {
        return await this.tenantSrv.getDataAccessMapAsync(capabilityId);
    }

    /**
     * Set up listener to the selection change action
     */
    private listenToSelection() {
        this.actionStore.multiselect$(this.settings.contextId).pipe(
            filter(data => data && data.originId !== this.settings.contextId),
            takeUntil(this.destroy$)
        ).subscribe(data => {
            if (data?.items?.length === 1) {
                this.filteredAlarms$.pipe(first()).subscribe(list => {
                    const index = list.findIndex(item => item.id === data.items[0].entityId);
                    if (index !== -1) {
                        this.viewport.scrollToIndex(index, 'smooth');
                    }
                });
            }
        });
    }

    /**
     * Set up listener to filter change action
     */
    private listenToFilterAction() {
        this.actionStore.filter$(this.settings.contextId).pipe(
            filter(data => data && data.originId !== this.settings.contextId),
            takeUntil(this.destroy$)
        ).subscribe(filterAction => {
            this.activeFilter$.next(filterAction.filter);
        });
    }

    /**
     * Set up listener to filter sync change action
     */
    private listenToFilterSync() {
        this.actionStore.filterSync$(this.settings.contextId).pipe(
            filter(data => !!data),
            takeUntil(this.destroy$)
        ).subscribe(syncAction => {
            if (this.settings.contextId === syncAction.originId) {
                // Set flag to being active
                this.filterSyncEnabled = true;

                // Trigger filter
                const activeFilter = this.activeFilter$.getValue();
                this.actionStore.filter(this.settings.contextId, activeFilter);
            } else {
                this.filterSyncEnabled = false;
            }
        });
    }

    /**
     * Set up routine for localization
     */
    private async initLocalization() {
        const tokens: string[] = Object.keys(AlarmListTranslationTokens).map(k => AlarmListTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.alarmSearchText = translatedTokens[AlarmListTranslationTokens.alarmSearchText];
    }
}

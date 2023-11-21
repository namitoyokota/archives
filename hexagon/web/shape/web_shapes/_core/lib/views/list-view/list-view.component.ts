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
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent } from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { LayoutCompilerAdapterService, View$v1 } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CommontenantAdapterService$v1, Tenant$v1, TenantSelectionComponent } from '@galileo/web_commontenant/adapter';
import {
  capabilityId,
  InjectableComponentNames,
  LAYOUT_MANAGER_SETTINGS,
  Shape$v1,
  ShapeFilter$v1,
  ShapeListFilter$v1,
} from '@galileo/web_shapes/_common';
import { BehaviorSubject, combineLatest, from, Observable, Subject } from 'rxjs';
import { filter, first, map, mergeMap, takeUntil } from 'rxjs/operators';

import { ActionStoreService } from '../../action-store.service';
import { Actions$v1 } from '../../actions.v1';
import { DataService } from '../../data.service';
import { CountInjectableComponent } from '../../injectable-component/count/count.component';
import { LicenseService } from '../../license.service';
import { ShapeStoreService } from '../../shape-store.service';
import { CreateEditComponent } from '../../shared/create-edit-dialog/create-edit-dialog.component';
import { SortOptions } from '../../shared/sorting/sort-options';
import { ShapeListSettings } from './list-view-settings';
import { ListViewTranslatedTokens, ListViewTranslationTokens } from './list-view.translation';


class ShapeListPersonalization$v1 {
  /** Saved filter */
  shapeListFilter?: ShapeListFilter$v1;

  /** Saved sort by option */
  sortBy?: SortOptions;

  constructor(params: ShapeListPersonalization$v1 = {} as ShapeListPersonalization$v1) {
    const {
      shapeListFilter = null,
      sortBy = null
    } = params;

    this.shapeListFilter = shapeListFilter;
    this.sortBy = sortBy;
  }
}

@Component({
  templateUrl: 'list-view.component.html',
  styleUrls: ['list-view.component.scss'],
  animations: [
    trigger('expansionState', [
      state(':enter', style({ height: '*' })),
      state(':leave', style({ height: '0' })),
      state('void', style({ height: '0' })),
      transition('* => *', animate('300ms ease-in-out'))
    ])
  ]
})

export class ListViewComponent implements OnInit, AfterViewInit, OnDestroy {

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

  /** State of the button */
  paneState$: Observable<boolean>;

  /** Expose ListViewTranslationTokens to HTML */
  tokens: typeof ListViewTranslationTokens = ListViewTranslationTokens;

  /** Filter being applied to the list */
  activeFilter$ = new BehaviorSubject<ShapeListFilter$v1>(new ShapeListFilter$v1());

  /** Sort that is currently being applied */
  activeSort$ = new BehaviorSubject<SortOptions>(null);

  /** Flag that when true will show the tenant info on card */
  showTenantInfo = false;

  /** List of filtered shapes */
  filteredShapes$: Observable<Shape$v1[]> = combineLatest([
    this.shapeStore.entity$.pipe(
      map((shapes: Shape$v1[]) => {
        // Don't show tombstoned shapes
        return shapes.filter(shape => !shape.tombstoned);
      })
    ),
    this.activeFilter$,
    this.activeSort$
  ]).pipe(
    map(([list, filters, sort]) => {
      let filterList = [];

      // Filter based on filter object
      if (filters) {
        filterList = filters.apply(list);
      }

      this.sortList(filterList);
      return filterList;
    })
  );

  /** Flag that is true if the view needs to show its own header */
  @HostBinding('class.show-header') showHeader = false;

  /** List of tenant Id that is sharing data */
  shareTenantIds: string[] = [];

  /** Flag that is true when the filter sync is enabled */
  filterSyncEnabled = false;

  /** List of views linked to this view */
  linkedViews$: Observable<View$v1[]>;

  /** Size of expanded card */
  expandSize$ = new BehaviorSubject<number>(0);

  /** Height of the cards */
  itemHeights$ = combineLatest([
    this.filteredShapes$,
    this.expandSize$
  ]).pipe(
    map(([list, size]) => {
      return list.map((i) => {
        if (i.id === this.expandedCardId && size) {
          return size;
        } else {
          const base = 73;
          const baseWithTenant = 74;


          if (this.showTenantInfo) {
            return baseWithTenant;
          } else {
            return base;
          }
        }
      });
    })
  );

  /** The shapes that are selected */
  selectedShapeIds$: Observable<string[]>;

  /** The last shape to have been selected */
  lastSelectedId: string;

  /** Id of shape that is being used as a shape filter */
  shapeFilterId$: Observable<string>;

  /** Translated token */
  tTokens: ListViewTranslatedTokens = {
    search: ''
  }

  /** Flag that is true when there is a license for shapes */
  isLicensed$ = this.licenseSrv.isLicensed$;

  /** Subject used unsubscribe to all subject on destroy of component */
  private destroy$ = new Subject<boolean>();

  private filterSettingsKey: string;

  /** Reference to the custom header component */
  private customHeaderRef: ComponentRef<CountInjectableComponent>;

  constructor(
    @Inject(LAYOUT_MANAGER_SETTINGS) public settings: ShapeListSettings,
    private tenantAdapter: CommontenantAdapterService$v1,
    private layoutAdapter: LayoutCompilerAdapterService,
    private shapeStore: ShapeStoreService,
    private identityAdapter: CommonidentityAdapterService$v1,
    private actionStore: ActionStoreService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dataSrv: DataService,
    private localizationAdapter: CommonlocalizationAdapterService$v1,
    private licenseSrv: LicenseService
  ) {
    this.showHeader = !this.settings.enablePortalFormatting;
    this.filterSettingsKey = 'shapeListSettings-' + this.settings.contextId;
    this.paneState$ = from(this.layoutAdapter.getOptionPaneStateAsync(this.settings.contextId)).pipe(
      mergeMap(bus => bus)
    );

    this.linkedViews$ = from(this.layoutAdapter.getLinkedViewsAsync<Actions$v1>(this.settings.contextId, Actions$v1.filterSync));

    this.selectedShapeIds$ = this.actionStore.multiselect$(this.settings.contextId).pipe(
      map(data => data?.items?.map(item => item.entityId))
    );

    this.shapeFilterId$ = this.actionStore.shapeFilter$(this.settings.contextId).pipe(
      map(filter => {
        return filter?.sourceId;
      })
    );
  }

  /**
   * On init lifecycle hook
   */
  async ngOnInit() {
    this.initLocalizationAsync();

    this.localizationAdapter.adapterEvents.languageChanged$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initLocalizationAsync();
    });

    this.tenantId = (await this.identityAdapter.getUserInfoAsync()).activeTenant;
    this.shareTenantIds = (await this.getTenantIdList()).concat([this.tenantId]);
  }

  /**
   * After view init lifecycle hook
   */
  ngAfterViewInit(): void {
    this.listenToSelection();
    this.listenToFilterAction();
    this.listenToFilterSync();
    this.createCustomHeaderAsync();
  }

  /**
   * On destroy lifecycle hook
   */
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();

    if (this.customHeaderRef) {
      this.customHeaderRef.destroy();
      this.customHeaderRef = null;
    }
  }

  /**
     * Resets the settings to the default
     */
  async resetFiltersSettingsAsync() {
    const defaultFilter = new ShapeListFilter$v1(this.settings.filter);
    defaultFilter.tenants = this.activeFilter$.getValue().tenants;

    this.activeFilter$.next(defaultFilter);
    this.activeSort$.next(this.settings.sortBy);
    this.setActiveFilter(defaultFilter, false);

    await this.identityAdapter.deleteUserPersonalizationAsync(
      (await this.identityAdapter.getUserInfoAsync()).id,
      this.filterSettingsKey
    );
  }

  /**
     * Open the option pane
     */
  closePane() {
    this.layoutAdapter.closeOptionPane(this.settings.contextId);
  }

  /**
     * Close the option pane
     */
  openPane() {
    this.layoutAdapter.openOptionPane(this.settings.contextId);
  }

  /**
   * Sets the active filter
   * @param activeFilter Filter to apply
   * @param saveSettings A flag that is true if settings should be saved to database
   */
  setActiveFilter(activeFilter: ShapeListFilter$v1, saveSettings = true) {
    const appliedFilter = new ShapeListFilter$v1(activeFilter);
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
   * Returns true if the current sort is not the same as the default sort
   */
  hasSortChanged(): boolean {
    return this.settings.sortBy !== this.activeSort$.getValue();
  }

  /**
   * Returns true if the current filter is not the same as the default filter
   */
  hasFilterChanged(): boolean {
    const currentFilter = new ShapeListFilter$v1(this.activeFilter$.getValue());
    const defaultFilter = new ShapeListFilter$v1(this.settings.filter);

    // Don't look tenant ids
    currentFilter.tenants = [];
    defaultFilter.tenants = [];

    const currentFilterStr = JSON.stringify(currentFilter).toLocaleLowerCase();
    const defaultFilterStr = JSON.stringify(defaultFilter).toLocaleLowerCase();

    return currentFilterStr !== defaultFilterStr;
  }

  /**
   * Clears any active filters
   */
  clearFilters() {
    const updatedFilters = new ShapeListFilter$v1(this.activeFilter$.getValue());
    updatedFilters.operations = [];
    this.setActiveFilter(updatedFilters);
    this.storeCurrentSettingsAsync();
  }

  /**
   * Sets the search string on the filter
   */
  searchShapes(searchStr: string) {
    const updatedFilters = new ShapeListFilter$v1(this.activeFilter$.getValue());
    updatedFilters.searchString = searchStr.toLocaleLowerCase().trim();

    this.setActiveFilter(updatedFilters);
    this.storeCurrentSettingsAsync();
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
   * Set the shape Ids that should be selected
   * @param id Shape id clicked on
   */
  setSelections(id: string, event: MouseEvent) {
    combineLatest([
      this.selectedShapeIds$.pipe(first()),
      this.filteredShapes$.pipe(first())
    ]).pipe(first()).subscribe(([ids, shapes]) => {
      let anchorIndex = 0;
      if (this.lastSelectedId) {
        const index = shapes.findIndex(a => a.id === this.lastSelectedId);
        anchorIndex = index > -1 ? index : 0;
      } else {
        anchorIndex = 0;
      }

      const targetIndex = shapes.findIndex(a => a.id === id);

      this.updateSelection(event, ids, id, anchorIndex, targetIndex, shapes.map(a => a.id));
    });
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

    const updateFilter = new ShapeListFilter$v1(this.activeFilter$.getValue());
    updateFilter.tenants = [].concat(tenants.map(tenant => tenant.id));
    this.setActiveFilter(updateFilter);
  }

  /**
     * Sets the sort option
     */
  setSort(sortOption: SortOptions) {
    this.activeSort$.next(sortOption);
  }

  /**
     * Sets the expanded state for shape card.
     * @param isExpanded Is the card details expanded
     * @param id shape id
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
   * Function used by a ngFor loop in the html to
   * help with performance.
   * @param index Item's index in list
   */
  trackByFn(index, item: Shape$v1) {
    return item.id;
  }

  /**
     * Sets the size of the card
     * @param size Sets the size of the card
     */
  setSize(size: number) {
    this.expandSize$.next(size);

    // Size is updated in a child component after change detection
    // has run. Need to let angular know about the change.
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  /**
     * Detail panel was destroyed when scrolling away
     */
  detailsDestroy(): void {

    // Wait for the next microtask to update
    Promise.resolve().then(() => {
      this.expandedCardId = null;
      this.setSize(0);
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  /**
   * Start creating a new shape
   */
  startCreateShape(): void {
    this.dialog.open(CreateEditComponent, {
      height: '90%',
      width: '90%',
      disableClose: true
    }).afterClosed().subscribe(shape => {
      if (shape) {
        this.dataSrv.create$(shape).toPromise()
          .catch(err => {
            this.dialog.open(CommonErrorDialogComponent, {
              data: {
                message: JSON.parse(err?.errors[0])?.errors[0]
              }
            });
          });
      }
    });
  }

  /**
   * Start edit shape
   */
  startEditShape(shape: Shape$v1): void {
    this.dialog.open(CreateEditComponent, {
      height: '90%',
      width: '90%',
      data: shape,
      disableClose: true
    }).afterClosed().subscribe(shape => {
      if (shape) {
        this.dataSrv.update$(shape).toPromise()
          .catch(err => {
            this.dialog.open(CommonErrorDialogComponent, {
              data: {
                message: JSON.parse(err?.errors[0])?.errors[0]
              }
            });
          });
      }
    });
  }

  /**
   * Start delete shape
   * @param id Shape id
   */
  async startDeleteShape(id: string): Promise<void> {
    await this.dataSrv.delete$(id).toPromise();

    this.shapeFilterId$.pipe(first()).subscribe(deleteId => {
      if (id === deleteId) {
        // Clear the filter
        this.actionStore.shapeFilter(this.settings.contextId, {
          originId: this.settings.contextId
        } as ShapeFilter$v1);
      }
    });
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
      this.filteredShapes$
    );
  }

  /**
   * Get a list of all tenants that is sharing
   */
  private async getTenantIdList() {
    return await this.tenantAdapter.getDataAccessMapAsync(capabilityId);
  }

  /**
     * Stores the current personalization settings
     */
  private async storeCurrentSettingsAsync() {
    this.identityAdapter.saveUserPersonalizationSettingsAsync<ShapeListPersonalization$v1>(
      (await this.identityAdapter.getUserInfoAsync()).id,
      this.filterSettingsKey,
      new ShapeListPersonalization$v1({
        shapeListFilter: !this.hasFilterChanged() ? null : this.activeFilter$.getValue(),
        sortBy: !this.hasSortChanged() ? null : this.activeSort$.getValue()
      })
    );
  }

  private async loadFilterFromStoreAsync() {
    // Load any filters that are currently saved
    const storedFilter = await this.identityAdapter.getUserPersonalizationSettingsAsync<ShapeListPersonalization$v1>(
      (await this.identityAdapter.getUserInfoAsync()).id,
      this.filterSettingsKey
    );

    if (storedFilter?.shapeListFilter) {

      // Updated the tenants on the filter
      const pendingFilter = new ShapeListFilter$v1(storedFilter?.shapeListFilter);
      pendingFilter.tenants = this.shareTenantIds;

      this.activeFilter$.next(pendingFilter);

      // Set the selected tenant
      if (this.tenantSelection) {
        this.tenantSelection.setSelectedTenants(pendingFilter.tenants);
      }
    } else if (this.settings.filter) {

      // Updated the tenants on the filter
      const pendingFilter = new ShapeListFilter$v1(this.settings.filter);
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
     * Sort the filter list of shape based on view settings
     */
  private sortList(list: Shape$v1[]): void {
    switch (this.activeSort$.getValue()) {
      case SortOptions.nameAsc:
        list.sort((a, b) => {
          return (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) ? 1 : -1;
        });
        break;
      case SortOptions.nameDesc:
        list.sort((a, b) => {
          return (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) ? 1 : -1;
        });
        break;
    }
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
   * Set up listener to the selection change action
   */
  private listenToSelection() {
    this.actionStore.multiselect$(this.settings.contextId).pipe(
      filter(data => data && data.originId !== this.settings.contextId),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (data?.items?.length === 1) {
        this.filteredShapes$.pipe(first()).subscribe(list => {
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
   * Updates the selected list based on the event
   * @param event Mouse event
   * @param current Current selection
   * @param targetId Target clicked on
   * @param anchorIndex Index of item to use as selection anchor
   * @param targetIndex Index of item clicked on
   * @param shapeIds Full list of shape ids selecting from
   */
  private updateSelection(
    event: MouseEvent,
    current: string[],
    targetId: string,
    anchorIndex: number,
    targetIndex: number,
    shapeIds: string[]) {

    let update: string[] = [];
    if (event?.shiftKey && event?.ctrlKey) {
      // Shift ctrl click. This is only an additive operation
      if (targetIndex < anchorIndex) {
        update = shapeIds.slice(targetIndex, anchorIndex + 1);
      } else {
        update = shapeIds.slice(anchorIndex, targetIndex + 1);
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
          update = shapeIds.slice(targetIndex, anchorIndex + 1);
        } else {
          update = shapeIds.slice(anchorIndex, targetIndex + 1);
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
   * Set up routine for localization
   */
  private async initLocalizationAsync(): Promise<void> {
    const tokens: string[] = Object.keys(ListViewTranslationTokens).map(k => ListViewTranslationTokens[k]);
    const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);

    this.tTokens.search = translatedTokens[ListViewTranslationTokens.search];

  }
}

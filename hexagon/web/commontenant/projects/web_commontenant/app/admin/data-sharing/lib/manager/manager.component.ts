import { Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import {
  CommonidentityAdapterService$v1,
  FeatureFlags as IdentityFeatureFlags,
  UserInfo$v1,
} from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
  capabilityId,
  CriteriaOperation$v1,
  CriteriaType$v1,
  DataSharingCapabilityOptions$v1,
  FeatureFlags as TenantFeatureFlags,
  Industries$v1,
  SharingConfiguration$v2,
  SharingCriteria$v1,
  Tenant$v1,
} from '@galileo/web_commontenant/_common';
import { CoreService, DataService$v2 } from '@galileo/web_commontenant/app/_core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { first, flatMap, map, takeUntil } from 'rxjs/operators';

import { DataSharingTenantStoreService } from '../data-sharing-tenant-store.service';
import { SharingCriteriaStoreService } from '../sharing-criteria-store.service';
import { ExternalSteps } from '../wizard/external-wizard/external-wizard-steps';
import { ExternalWizardData } from '../wizard/external-wizard/external-wizard.component';
import { InternalWizardData, Steps as InternalSteps } from '../wizard/internal-wizard/internal-wizard.component';
import { ChangelogDialogData, DataSharingChangelogDialogComponent } from './changelog-dialog/changelog-dialog.component';
import { ConfirmSaveDialogComponent } from './confirm-save-dialog/confirm-save-dialog.component';
import { ManagerTranslationTokens } from './manager.translation';

export enum SharingTab {
    external = 0,
    internal = 1
}

@Component({
    selector: 'hxgn-commontenant-data-sharing-manager',
    templateUrl: 'manager.component.html',
    styleUrls: ['manager.component.scss']
})

export class ManagerComponent implements OnInit, OnDestroy {

    /** The tab that is selected */
    @Input('selectedTab')
    set setSelectedTab(tab: SharingTab) {
        this.changeTab(tab);
    }

    /** The current tenant */
    @Input() tenant: Tenant$v1;

    /** The tab that is selected */
    selectedTab = SharingTab.external;

    /** Events the state of loading */
    @Output() isLoading = new EventEmitter<boolean>();

    /** Event that the internal wizard should be started */
    @Output() startInternalWizard = new EventEmitter<InternalWizardData>();

    /** Event that the external wizard should be started */
    @Output() startExternalWizard = new EventEmitter<ExternalWizardData>();

    /** Event when the selected tab changes */
    @Output() tabChange = new EventEmitter<SharingTab>();

    /** Save */
    @Output() saveChanges = new EventEmitter<void>();

    /** A flag that is true if a setup screen should be shown */
    @HostBinding('class.setup') showSetup = false;

    /** List of industries in the system */
    industries$: Observable<Industries$v1[]> = this.coreSrv.industries$;

    /** List of tenants that have opted into data sharing */
    optInTenants$: Observable<Tenant$v1[]> = this.dataSrv.dataSharing.getSharees$();

    /** List of selected sharing criteria */
    private selectedSharingCriteriaIds = new BehaviorSubject<string[]>([]);

    /** List of columns to hide when filter by group is disabled */
    readonly filterAllHiddenCol = ['organizations', 'canAccess', 'useGlobalPermissions'];

    /** List of columns to hide when filter by group is enabled */
    readonly filterGroupCol = ['organizations', 'useGlobalPermissions'];

    /** List of selected sharing criteria */
    selectedSharingCriteriaIds$ = this.selectedSharingCriteriaIds.asObservable();

    /** List of external sharing overrides */
    externalSharingOverrides$: Observable<SharingCriteria$v1<any, any>[]> = this.criteriaStore.valueChanges$.pipe(
        map(list => {
            return list.filter(sc => sc.criteriaType === CriteriaType$v1.externalTenantOverride);
        })
    );

    /** List of internal sharing overrrides */
    internalSharingOverrides$: Observable<SharingCriteria$v1<any, any>[]> = this.criteriaStore.valueChanges$.pipe(
        map(list => {
            return list.filter(sc => sc.criteriaType === CriteriaType$v1.internalGroupOverride);
        })
    );

    /** List of external global sharing criteria. Filter out any that is not enabled on the tenant */
    externalSharingGlobals$: Observable<SharingCriteria$v1<any, any>[]> = combineLatest([
        this.criteriaStore.valueChanges$,
        this.tenantStore.valueChanges$
    ]).pipe(
        map(([criteria, tenant]) => {
            return criteria.filter(sc => {
                return sc.criteriaType === CriteriaType$v1.externalTenantGlobal &&
                    !!tenant.configuredDataSharingTypes[CriteriaType$v1.externalTenantGlobal]?.find(id => id === sc.capabilityId);
            });
        })
    );

    /** List of external global sharing criteria. Filter out any that is not enabled on the tenant */
    internalSharingGlobals$: Observable<SharingCriteria$v1<any, any>[]> = combineLatest([
        this.criteriaStore.valueChanges$,
        this.tenantStore.valueChanges$
    ]).pipe(
        map(([criteria, tenant]) => {
            return criteria.filter(sc => {
                return sc.criteriaType === CriteriaType$v1.internalGroupGlobal &&
                    !!tenant.configuredDataSharingTypes[CriteriaType$v1.internalGroupGlobal]?.find(id => id === sc.capabilityId);
            });
        })
    );

    /** List of selected sharing configuration */
    externalSharingConfiguration$: Observable<SharingConfiguration$v2[]> = combineLatest([
        this.optInTenants$,
        this.selectedSharingCriteriaIds$,
        this.externalSharingOverrides$
    ]).pipe(
        map(([tenants, selectedIds, overrideCriteria]) => {
            this.checkSetup();
            if (!overrideCriteria?.length) {
                return [];
            }

            // Filter based on selected ids
            const criteria = overrideCriteria.filter(c => {
                return !!selectedIds.find(id => id === c.referenceId);
            });

            /** Map of tenant id to sharing configuration */
            const config = new Map<string, SharingConfiguration$v2>();

            criteria.forEach(c => {
                let item: SharingConfiguration$v2;
                if (config.has(c.shareeTenantId)) {
                    item = config.get(c.shareeTenantId);
                } else {
                    const tenant = tenants.find(t => t.id === c.shareeTenantId);
                    if (tenant) {
                        item = new SharingConfiguration$v2({
                            ownerId: c.shareeTenantId,
                            ownerName: tenant.name,
                            ownerIcon: tenant.tenantIconUrl
                        } as SharingConfiguration$v2);
                    }

                }

                if (item) {
                    item.criteria.push(c);
                    config.set(c.shareeTenantId, item);
                }

            });

            return Array.from(config.values());
        })
    );

    /** List of group ids being shared with */
    filterByGroup$ = this.internalSharingOverrides$.pipe(
        map(criteria => {
            const list = criteria.map(c => c.groupId);
            return [... new Set(list)]?.length > 1;
        })
    );

    /** A flag that is true if external data sharing is enabled */
    externalSharingEnabled$: Observable<boolean> = this.externalSharingGlobals$.pipe(
        map(criteria => {
            const externalCriteria = criteria.map(c => new SharingCriteria$v1<any, any>(c));

            // Get the capability manifest
            let isEnabled = false;
            // Look at each criteria option and decided if it needs to be updated or not
            externalCriteria.forEach(sc => {
                if (sc.capabilityOperations[0]?.enabled) {
                    isEnabled = true;
                }
            });
            return isEnabled;
        })
    );

    /** Returns true if internal sharing is enabled. If its false then share all is enabled */
    internalShareAllData$: Observable<boolean> = this.tenantStore.valueChanges$.pipe(
        map(t => !t.optIntoGroupDataSharing)
    );

    /** List of selected internal sharing configuration */
    internalSharingConfiguration$: Observable<SharingConfiguration$v2[]> = combineLatest([
        this.optInTenants$,
        this.selectedSharingCriteriaIds$,
        this.internalSharingOverrides$
    ]).pipe(
        flatMap(async ([tenants, selectedIds, overrideCriteria]) => {
            this.checkSetup();
            if (!overrideCriteria?.length) {
                return [];
            }

            // Filter based on selected ids
            const criteria = overrideCriteria.filter(c => {
                return !!selectedIds.find(id => id === c.referenceId);
            });

            /** Map of tenant id to sharing configuration */
            const config = new Map<string, SharingConfiguration$v2>();

            const otherUsers = await this.localizationAdapter.getTranslationAsync(ManagerTranslationTokens.otherUsers);

            for (let i = 0; i < criteria.length; i++) {
                const c = criteria[i];

                let group;
                if (c.groupId !== '00000000-0000-0000-0000-000000000000') {
                    group = await this.identityAdapter.getGroupsAsync([c.groupId]).then(groups => {
                        if (groups?.length) {
                            return groups[0];
                        } else {
                            return null;
                        }
                    });
                }

                let item: SharingConfiguration$v2;
                if (config.has(c.shareeTenantId)) {
                    item = config.get(c.shareeTenantId);
                } else {
                    item = new SharingConfiguration$v2({
                        ownerId: c.groupId,
                        ownerName: group ? group?.name : otherUsers,
                        ownerIcon: group ? group?.groupIconUrl : null
                    } as SharingConfiguration$v2);
                }

                if (item) {
                    item.criteria.push(c);
                    config.set(c.shareeTenantId, item);
                }
            }

            return Array.from(config.values());
        })
    );

    /** Are there any unsaved changes */
    isDirty$ = combineLatest([
        this.criteriaStore.isDirty$,
        this.tenantStore.isDirty$
    ]).pipe(
        map(([criteria, tenant]) => {
            return criteria || tenant;
        })
    );

    /** Expose SharingTab to HTML */
    sharingTab: typeof SharingTab = SharingTab;

    /** Expose ManagerTranslationTokens to HTML */
    tokens: typeof ManagerTranslationTokens = ManagerTranslationTokens;

    /** Current tenant */
    tenant$ = this.tenantStore.valueChanges$;

    /** List of users in the tenant */
    users: UserInfo$v1[];

    /** List of tenants in the system */
    tenants: Tenant$v1[];

    /** Map for translated capability tokens */
    capabilityTokens: Map<string, string> = new Map<string, string>();

    /** Export external wizard step to HTML */
    externalWizardSteps: typeof ExternalSteps = ExternalSteps;

    /** Export internal wizard step to HTML */
    internalWizardSteps: typeof InternalSteps = InternalSteps;

    /** A flag that is true if external has been configured */
    isExternalConfigured$ = combineLatest([
        this.externalSharingOverrides$,
        this.externalSharingGlobals$
    ]).pipe(
        map(([o, g]) => {
            return !!o.length || !!g.length;
        })
    );

    /** A flag that is true if internal has been configured */
    isInternalConfigured$ = combineLatest([
        this.internalSharingOverrides$,
        this.internalSharingGlobals$,
        this.tenant$
    ]).pipe(
        map(([o, g, t]) => {
            return (!!o.length || !!g.length) && t.optIntoGroupDataSharing;
        })
    );

    /** Whether the internal tour in the criteria table should be shown. Defaults to true. */
    showExternalTour = true;

    /** Whether the internal tour in the criteria table should be shown. Defaults to true. */
    showInternalTour = true;

    /** Flag to indicate whether the feature flag is on */
    showChangelog: boolean;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private coreSrv: CoreService,
        private dataSrv: DataService$v2,
        private criteriaStore: SharingCriteriaStoreService,
        private tenantStore: DataSharingTenantStoreService,
        private identityAdapter: CommonidentityAdapterService$v1,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private ffSrv: CommonfeatureflagsAdapterService$v1,
        private dialog: MatDialog
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        // Check if internal data sharing has been set up
        this.checkSetup();

        // Go try to get translation for other users to prevent blocking later if the token is not there
        this.localizationAdapter.localizeStringAsync(ManagerTranslationTokens.otherUsers);

        // Get the list of users in the tenant
        this.identityAdapter.getUsersAsync().then(users => {
            this.users = users;
        });

        // Get the list of tenants in the system
        this.dataSrv.tenant.getList$().toPromise().then(tenants => {
            this.tenants = tenants;
        });

        // Generate capability map
        this.mapCababilities();

        // Check if changelog feature flag is on
        this.showChangelog = this.ffSrv.isActive(IdentityFeatureFlags.viewChangelog) &&
            this.ffSrv.isActive(TenantFeatureFlags.dataSharingTimeline);

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.localizationAdapter.localizeStringAsync(ManagerTranslationTokens.otherUsers);
            this.mapCababilities();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    private mapCababilities() {
        this.dataSrv.dataSharing.getCapabilityManifests$().toPromise().then(capabilityList => {
            const capabilityNameTokens: string[] = capabilityList.map(x => x.nameToken);
            this.localizationAdapter.localizeStringsAsync(capabilityNameTokens).then(async () => {
                const translatedTokens = await this.localizationAdapter.getTranslationAsync(capabilityNameTokens);
                capabilityList.forEach(capability => {
                    this.capabilityTokens.set(capability.id, translatedTokens[capability.nameToken])
                });
            });
        })
    }

    /**
     * Sets the selected criteria
     * @param criteria The criteria that is selected
     */
    setSelectedCriteria(criteria: SharingCriteria$v1<any, any>[]): void {
        this.selectedSharingCriteriaIds.next(criteria.map(c => c.referenceId));
    }

    /**
     * Updates the given criteria
     * @param criteria The updated criteria
     */
    updateCriteria(criteria: SharingCriteria$v1<any, any>): void {
        this.criteriaStore.upsertCriteria(criteria);
    }

    /**
     * Sets the selected tab
     * @param tab The tab to change to
     */
    changeTab(tab: SharingTab): void {
        this.selectedTab = tab;

        this.checkSetup();
    }

    /**
     * Checks if the selected tab has been setup yet
     */
    checkSetup(): void {
        if (this.selectedTab === SharingTab.internal) {
            // Check if internal sharing is setup
            this.isInternalConfigured$.pipe(first()).subscribe(c => {
                this.showSetup = !c;
            });
        } else {
            this.isExternalConfigured$.pipe(first()).subscribe(c => {
                this.showSetup = !c;
            });
        }
    }

    /**
     * Sets the enable data receiving status
     * @param enabled Is data receiving enabled
     */
    updateReceiving(enabled: boolean): void {
        this.tenantStore.valueChanges$.pipe(first()).subscribe(t => {
            const update = new Tenant$v1(t);
            update.optInAsSharee = enabled;
            this.tenantStore.update(update);
        });
    }

    /**
     * Toggles data sharing being enabled or disabled
     * @param enabled Is data sharing enabled
     */
    toggleExternalDataSharing(enabled: boolean): void {
        this.externalSharingGlobals$.pipe(first()).subscribe(criteria => {
            const externalCriteria = criteria.map(c => new SharingCriteria$v1<any, any>(c));

            // Get the capability manifest
            const manifests = this.coreSrv.getCapabilityList(null, true, false, true);

            // Look at each criteria option and decided if it needs to be updated or not
            externalCriteria.forEach(sc => {
                const capability = manifests.find(m => m.id === sc.capabilityId);
                const operationSettings = new DataSharingCapabilityOptions$v1(
                    capability.compatible.find(c => c.capabilityId === capabilityId)?.options
                );

                sc.capabilityOperations = operationSettings.externalSharingOperations.map(so => {
                    return new CriteriaOperation$v1({
                        capabilityOperationId: so,
                        enabled: enabled
                    } as CriteriaOperation$v1);
                });
            });

            this.criteriaStore.upsertCriteria(externalCriteria);
        });
    }

    /**
     * Toggles data sharing being enabled or disabled
     * @param enabled Is data sharing enabled
     */
    toggleInternalDataSharing(enabled: boolean): void {
        this.tenantStore.valueChanges$.pipe(first()).subscribe(tenant => {
            const update = new Tenant$v1(tenant);
            update.optIntoGroupDataSharing = enabled;

            this.tenantStore.update(update);
        });
    }

    /**
     * Deletes the given criteria
     * @param ids Ids to delete
     */
    deleteCriteria(ids: string): void {
        this.criteriaStore.deleteCriteria(ids);
    }

    /**
     * Discard any changes
     */
    discardChanges(): void {
        this.criteriaStore.discardChanges();
        this.tenantStore.discardChanges();

        this.checkSetup();
    }

    /**
     * Confirms with the user they want to save
     */
    confirmSave(): void {
        this.dialog.open(ConfirmSaveDialogComponent, {
            disableClose: true,
            autoFocus: false
        }).afterClosed().subscribe(save => {
            if (save) {
                this.save();
            }
        });
    }

    /**
     * Open changelog dialog
     */
    openChangelogDialog() {
        this.dialog.open(DataSharingChangelogDialogComponent, {
            autoFocus: false,
            disableClose: true,
            height: '900px',
            width: '820px',
            data: {
                tenantId: this.tenant.id,
                users: this.users,
                tenants: this.tenants,
                tokenMap: this.capabilityTokens
            } as ChangelogDialogData
        });
    }

    /**
     * Show internal wizard
     * @param filterByGroups Flag that is true if filter by groups is set
     * @param editStep The step that is being edited
     */
    async showInternalWizard(filterByGroups: boolean = null, editStep: InternalSteps = null): Promise<void> {
        const currentCriteria = await this.criteriaStore.valueChanges$.pipe(first()).toPromise();
        this.startInternalWizard.emit(new InternalWizardData({
            filterByGroups, editStep,
            sharingCriteria: currentCriteria
        }));
    }

    /**
     * Show the external wizard
     */
    async showExternalWizard(editStep: ExternalSteps = null): Promise<void> {
        const currentCriteria = await this.criteriaStore.valueChanges$.pipe(first()).toPromise();
        this.startExternalWizard.emit(new ExternalWizardData({
            editStep,
            sharingCriteria: currentCriteria
        }));
    }

    /**
     * Save changes to the criteria
     */
    private async save(): Promise<void> {
        this.saveChanges.emit();
    }
}

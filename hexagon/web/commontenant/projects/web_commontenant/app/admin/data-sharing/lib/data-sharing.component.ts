import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { DirtyComponent$v1 } from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CriteriaType$v1, Tenant$v1, TranslationGroup, capabilityId } from '@galileo/web_commontenant/_common';
import { CoreService, DataService$v2 } from '@galileo/web_commontenant/app/_core';
import { combineLatest, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { DataSharingTenantStoreService } from './data-sharing-tenant-store.service';
import { DataSharingTranslationTokens } from './data-sharing.translation';
import { ConfirmSaveDialogComponent } from './manager/confirm-save-dialog/confirm-save-dialog.component';
import { ManagerComponent, SharingTab } from './manager/manager.component';
import { ShareAllDialogComponent } from './share-all-dialog/share-all-dialog.component';
import { SharingCriteriaStoreService } from './sharing-criteria-store.service';
import { ExternalWizardComponent, ExternalWizardData } from './wizard/external-wizard/external-wizard.component';
import { InternalWizardComponent, InternalWizardData } from './wizard/internal-wizard/internal-wizard.component';

@Component({
    selector: 'hxgn-commontenant-data-sharing-v2',
    templateUrl: 'data-sharing.component.html',
    styleUrls: ['data-sharing.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix, @typescript-eslint/naming-convention
export class DataSharingComponent$v2 implements OnInit, DirtyComponent$v1, OnDestroy {

    /** Ref to manager component */
    @ViewChild(ManagerComponent) managerRef: ManagerComponent;

    /** A flag that is true when a loading indicator should be shown */
    isLoading = true;

    /** A flag that is true when data sharing is configured */
    isConfigured = null;

    /** Ref to wizard */
    wizardRef: MatDialogRef<any, any>;

    /** The tab that is selected */
    selectedTab = SharingTab.external;

    /** The current tenant */
    tenant$ = this.tenantStore.valueChanges$;

    /** A flag that is true if there are unsaved changes */
    isDirty$ = combineLatest([
        this.sharingCriteriaStore.isDirty$,
        this.tenantStore.isDirty$
    ]).pipe(
        map(([c, t]) => {
            return c || t;
        })
    );

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private sharingCriteriaStore: SharingCriteriaStoreService,
        private tenantStore: DataSharingTenantStoreService,
        private dialog: MatDialog,
        private dataSrv: DataService$v2,
        private identityAdapter: CommonidentityAdapterService$v1,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private titleSrv: Title,
        private coreSrv: CoreService
    ) {
        this.initLocalization();
        this.setTitle();
    }

    /**
     * On init lifecycle hook
     */
    async ngOnInit() {
        // Load User
        const user = await this.identityAdapter.getUserInfoAsync();
        await this.dataSrv.tenant.get$(user.activeTenant).toPromise().then(tenant => {
            this.tenantStore.setSource(tenant);
        });

        // Load sharing criteriaStore
        this.isConfigured = await this.dataSrv.sharingCriteria.get$().toPromise().then(criteria => {
            // Filter out disabled data
            const manifests = this.coreSrv.getCapabilityList(capabilityId);

            criteria = criteria.filter(c => {
                const manifest = manifests.find(m => m.id === c.capabilityId);
                if (c.criteriaType === CriteriaType$v1.internalGroupGlobal ||
                    c.criteriaType === CriteriaType$v1.internalGroupOverride) {
                    return !manifest?.excludeFromInternalDataSharing;
                }

                if (c.criteriaType === CriteriaType$v1.externalTenantGlobal ||
                    c.criteriaType === CriteriaType$v1.externalTenantOverride) {
                    return !manifest?.excludeFromExternalDataSharing;
                }

                return false;
            });

            this.sharingCriteriaStore.setSource(criteria);

            return !!criteria?.length;
        });

        // Load sharing Criteria
        this.isLoading = false;

        // Check if a tab should be selected
        this.sharingCriteriaStore.valueChanges$.pipe(first()).subscribe(criteria => {
            if (!!criteria?.find(c => c.criteriaType === CriteriaType$v1.externalTenantGlobal)) {
                this.selectedTab = SharingTab.external;
            } else if (!!criteria?.find(c => c.criteriaType === CriteriaType$v1.internalGroupGlobal)) {
                this.selectedTab = SharingTab.internal;
            }
        });

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
            this.setTitle();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Starts the external data sharing wizard
     */
    startWizard(settings: ExternalWizardData = null): void {
        this.dialog.open(ExternalWizardComponent, {
            disableClose: true,
            autoFocus: false,
            data: settings
        }).afterClosed().subscribe(async (sharingCriteria) => {

            if (!sharingCriteria) {
                return;
            }

            // Update data store
            this.sharingCriteriaStore.setValueChanges(sharingCriteria);

            // Save
            await this.save();

            // Check if there is any criteria
            this.sharingCriteriaStore.valueChanges$.pipe(first()).subscribe(sc => {
                if (sc) {
                    this.isConfigured = true;

                    // Go to the external tab
                    this.selectedTab = SharingTab.external;
                }
            });
        });
    }

    /**
     * Starts the internal dat sharing wizard
     */
    startInternalWizard(settings: InternalWizardData = null): void {

        this.dialog.open(InternalWizardComponent, {
            disableClose: true,
            autoFocus: false,
            data: settings
        }).afterClosed().subscribe(async (sharingCriteria) => {

            if (!sharingCriteria) {
                return;
            }

            // Update data store
            this.sharingCriteriaStore.setValueChanges(sharingCriteria);

            // Save
            await this.save();

            // Check if there is any criteria
            this.sharingCriteriaStore.valueChanges$.pipe(first()).subscribe(sc => {
                if (sc) {
                    this.isConfigured = true;

                    // Go to the internal tab
                    this.selectedTab = SharingTab.internal;
                }
            });
        });
    }

    /**
     * Show dialog before saving
     */
    async saveChangesAsync(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.dialog.open(ConfirmSaveDialogComponent, {
                disableClose: true,
                autoFocus: false
            }).afterClosed().subscribe(save => {
                if (save) {
                    this.save();
                }

                resolve();
            });
        });
    }

    /**
     * Save changes to the criteria
     */
    async save(): Promise<void> {
        if (this.managerRef) {
            this.managerRef.checkSetup();
        }

        this.isLoading = true;

        const requests = [];

        const newCriteria = await this.sharingCriteriaStore.valueChangeInserts$.pipe(first()).toPromise();
        if (newCriteria?.length) {
            requests.push(
                this.dataSrv.sharingCriteria.create$(newCriteria).toPromise().then(criteria => {
                    this.sharingCriteriaStore.upsertCriteria(criteria);
                    this.sharingCriteriaStore.commit(criteria.map(item => item.referenceId));
                })
            );
        }

        // Criteria updates
        const updatedCriteria = await this.sharingCriteriaStore.valueChangeUpdates$.pipe(first()).toPromise();
        if (updatedCriteria?.length) {
            requests.push(this.dataSrv.sharingCriteria.update$(updatedCriteria).toPromise().then(update => {
                this.sharingCriteriaStore.upsertCriteria(update);
                // Update source
                this.sharingCriteriaStore.commit(update.map(item => item.referenceId));
            }));
        }

        // Criteria deletes
        const deleteCriteria = await this.sharingCriteriaStore.valueChangeDeletes$.pipe(first()).toPromise();
        if (deleteCriteria?.length) {
            const ids = deleteCriteria.map(c => c.sharingCriteriaId);
            requests.push(this.dataSrv.sharingCriteria.delete$(ids).toPromise().then(() => {
                this.sharingCriteriaStore.deleteCriteria(ids);
                this.sharingCriteriaStore.commit(deleteCriteria.map(item => item.referenceId));
            }));
        }

        // Tenant updates
        const tenantIsUpdated = await this.tenantStore.isDirty$.pipe(first()).toPromise();
        let shareAll = false;
        if (tenantIsUpdated) {
            const oldTenant = await this.tenantStore.source$.pipe(first()).toPromise();
            const tenant = await this.tenantStore.valueChanges$.pipe(first()).toPromise();

            shareAll = !tenant.optIntoGroupDataSharing && oldTenant.optIntoGroupDataSharing !== tenant.optIntoGroupDataSharing;
            requests.push(this.dataSrv.tenant.update$(tenant).toPromise().then(t => {
                this.tenantStore.setSource(new Tenant$v1(t));
            }));
        }

        await Promise.all(requests);

        this.isLoading = false;

        // If sharing is set to share all then show done dialog
        if (shareAll) {
            this.dialog.open(ShareAllDialogComponent, {
                disableClose: true,
                autoFocus: false
            });
        }
    }

    /**
     * Sets the page's title
     */
    private async setTitle() {
        this.titleSrv.setTitle('HxGN Connect');

        const title = await this.localizationAdapter.getTranslationAsync(DataSharingTranslationTokens.dataSharing);
        this.titleSrv.setTitle(`HxGN Connect - ${title}`);
    }

    private initLocalization() {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.common,
            TranslationGroup.commonAdmin,
            TranslationGroup.core,
            TranslationGroup.dataSharing
        ]);
    }
}

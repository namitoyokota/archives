import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Guid } from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import {
    capabilityId,
    CriteriaOperation$v1,
    CriteriaType$v1,
    DataSharingCapabilityOptions$v1,
    SharingCriteria$v1,
    Tenant$v1,
} from '@galileo/web_commontenant/_common';
import { combineLatest, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { CoreService } from '@galileo/web_commontenant/app/_core';
import { DataSharingTenantStoreService } from '../../data-sharing-tenant-store.service';
import { SharingCriteriaStoreService } from '../../sharing-criteria-store.service';
import { IWizardStepComponent } from '../wizard-step/wizard-step.component';
import { WizardService } from '../wizard.service';
import { ExternalSteps } from './external-wizard-steps';
import { ExternalWizardTranslationTokens } from './external-wizard.translation';

export class ExternalWizardData {

    /** The step that is being edited */
    editStep?: ExternalSteps;

    /** List of staring sharing criteria */
    sharingCriteria?: SharingCriteria$v1<any, any>[];

    constructor(param: ExternalWizardData = {} as ExternalWizardData) {
        const {
            editStep = null,
            sharingCriteria = []
        } = param;

        this.editStep = editStep;

        if (sharingCriteria?.length) {
            this.sharingCriteria = sharingCriteria.map(sc => new SharingCriteria$v1<any, any>(sc));
        } else {
            this.sharingCriteria = sharingCriteria;
        }
    }
}

@Component({
    templateUrl: 'external-wizard.component.html',
    styleUrls: ['external-wizard.component.scss'],
    providers: [
        WizardService,
        SharingCriteriaStoreService
    ]
})
export class ExternalWizardComponent implements OnInit, OnDestroy {

    /** The step that is currently active */
    activeStep: ExternalSteps = ExternalSteps.dataSharingSetup;

    /** Step being edited */
    editStep: ExternalSteps;

    /** Expose Steps to the HTML */
    steps: typeof ExternalSteps = ExternalSteps;

    /** Expose ExternalWizardTranslationTokens to HTML */
    tokens: typeof ExternalWizardTranslationTokens = ExternalWizardTranslationTokens;

    /** The tenant */
    tenant$ = this.tenantStore.valueChanges$;

    /** A flag that is true if receiving data has been set */
    receiveDataSet = false;

    /** Expose CriteriaType$v1 to HTML */
    criteriaType: typeof CriteriaType$v1 = CriteriaType$v1;

    /** Id of the current tenant */
    tenantId: string;

    /** A flag that is true when loading UI should be shown */
    isLoading = false;

    /** List of tenants that is currently selected */
    selectedTenantIds$ = this.criteriaStore.valueChanges$.pipe(
        map(list => {
            return [...new Set(list.filter(criteria => {
                return criteria.criteriaType === CriteriaType$v1.externalTenantOverride;
            }).map(criteria => criteria.shareeTenantId))];
        })
    );

    /** A flag that is true if data sharing should be applied to network */
    shareDataEnabled: boolean = null;

    /** A flag that is true if internal sharing should be cloned */
    cloneEnabled = false;

    /** The last step a user was on */
    previousSteps: ExternalSteps[] = [ExternalSteps.dataSharingSetup];

    /** A flag that is true if there is internal sharing already setup */
    hasInternalSharing = false;

    /** A flag that is true if there is any configuration */
    hasConfiguration$ = combineLatest([
        this.criteriaStore.valueChanges$.pipe(
            map(criteria => {
                return !!criteria?.find(c => c.criteriaType === CriteriaType$v1.externalTenantGlobal);
            })
        ),
        this.tenantStore.valueChanges$.pipe(
            map(tenant => {
                return !!tenant.configuredDataSharingTypes[CriteriaType$v1.externalTenantGlobal]?.length;
            })
        )
    ]).pipe(
        map(([hasCriteria, hasDataTypes]) => {
            return hasCriteria || hasDataTypes;
        })
    );

    /** List of enabled capabilities */
    enabledCapabilities$ = this.tenant$.pipe(
        map(t => {
            if (t.configuredDataSharingTypes) {
                return t.configuredDataSharingTypes[CriteriaType$v1.externalTenantGlobal];
            } else {
                return [];
            }
        })
    );

    /**  Observable for component destroyed. Used to clean up subscriptions. */
    private destroy$ = new Subject<boolean>();

    constructor(
        private dialogRef: MatDialogRef<ExternalWizardComponent>,
        private wizardSrv: WizardService,
        private tenantStore: DataSharingTenantStoreService,
        private criteriaStore: SharingCriteriaStoreService,
        private coreSrv: CoreService,
        private identityAdapter: CommonidentityAdapterService$v1,
        @Inject(MAT_DIALOG_DATA) public settings: ExternalWizardData
    ) {
        if (this.settings?.editStep) {
            this.editStep = this.settings.editStep;

            // Set the step to start on
            this.activeStep = this.settings.editStep;
            this.previousSteps = [ExternalSteps.dataSharingSetup];
        }

        if (settings?.sharingCriteria?.length) {
            this.criteriaStore.setSource(settings.sharingCriteria);
        }
    }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.criteriaStore.valueChanges$.pipe(first()).subscribe(criteria => {
            this.hasInternalSharing = !!criteria?.find(c => c.criteriaType === CriteriaType$v1.internalGroupGlobal);
        });

        this.identityAdapter.getUserInfoAsync().then(identity => {
            this.tenantId = identity.activeTenant;
        });

        this.wizardSrv.close$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.cancel();
        });
    }

    /**
     * On init lifecycle hook
     */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Check if the current step is complete. After the current step
     * confirms it is complete the UI navigates to the next step.
     * @param currentStep The step the user is currently on
     * @param step The step to go to
     * @param ref Reference to the current step
     */
    async setActiveStepAsync(currentStep: ExternalSteps, step: ExternalSteps, ref: IWizardStepComponent): Promise<void> {
        const isComplete = await ref.completeAsync();
        if (isComplete) {
            this.activeStep = step;
            this.previousSteps = [currentStep, ...this.previousSteps];
        }
    }

    /**
     * Sets if receive data is enabled
     * @param isEnabled Is receive data enabled
     */
    async receiveDataChange(isEnabled: boolean): Promise<void> {
        this.receiveDataSet = true;

        const tenant = new Tenant$v1(await this.tenant$.pipe(first()).toPromise());
        tenant.optInAsSharee = isEnabled;
        this.tenantStore.update(tenant);
    }

    /**
     * Sets the list of enabled capabilities on the tenant object
     * @param ids List of ids of enabled capabilities
     */
    async dataTypesChange(ids: string[]): Promise<void> {
        this.receiveDataSet = true;

        const tenant = new Tenant$v1(await this.tenant$.pipe(first()).toPromise());

        if (!tenant.configuredDataSharingTypes) {
            tenant.configuredDataSharingTypes = {} as Record<CriteriaType$v1, string[]>;
        }

        tenant.configuredDataSharingTypes[CriteriaType$v1.externalTenantGlobal] = ids;
        this.tenantStore.update(tenant);

    }

    /**
     * Sets if the globals should be enabled or disabled by default
     * @param isShared A flag that is true if data sharing is enabled
     */
    toggleDataShare(isShared: boolean): void {
        if (isShared === null) {
            return;
        }

        this.shareDataEnabled = isShared;
        this.criteriaStore.valueChangeInserts$.pipe(
            first(),
            map(criteria => {
                // Only return overrides
                return criteria.filter(c => c.criteriaType === CriteriaType$v1.externalTenantOverride);
            })
        ).subscribe(criteria => {
            const update = criteria.map(c => new SharingCriteria$v1<any, any>(c));
            // Get the capability manifest
            const manifests = this.coreSrv.getCapabilityList(null, true, false, true);
            update.forEach(sc => {
                const capability = manifests.find(m => m.id === sc.capabilityId);
                const operationSettings = new DataSharingCapabilityOptions$v1(
                    capability.compatible.find(c => c.capabilityId === capabilityId)?.options
                );

                sc.capabilityOperations = operationSettings.externalSharingOperations.map(so => {
                    return new CriteriaOperation$v1({
                        capabilityOperationId: so,
                        enabled: isShared

                    } as CriteriaOperation$v1);
                });
            });

            this.criteriaStore.upsertCriteria(update);
        });
    }

    /**
     * To back to the previous step
     */
    goBack(): void {
        if (this.previousSteps?.length) {
            this.activeStep = this.previousSteps.shift();
        }
    }

    /** Clones internal data sharing */
    clone(): void {
        if (this.cloneEnabled) {
            this.hasConfiguration$.pipe(first()).subscribe(isSetup => {
                if (!isSetup) {
                    // Clone data types
                    this.tenantStore.valueChanges$.pipe(first()).subscribe(t => {
                        const update = new Tenant$v1(t);
                        const dataTypes = update.configuredDataSharingTypes[CriteriaType$v1.internalGroupGlobal];
                        update.configuredDataSharingTypes[CriteriaType$v1.externalTenantGlobal] = dataTypes;

                        this.tenantStore.update(update);
                    });

                    // Clone sharing criteria
                    this.criteriaStore.valueChanges$.pipe(
                        first(),
                        map(criteria => {
                            return criteria.filter(c => c.criteriaType === CriteriaType$v1.internalGroupGlobal);
                        })
                    ).subscribe(criteria => {
                        criteria.forEach(c => {
                            const manifests = this.coreSrv.getCapabilityList(null, true, false, true);
                            const capability = manifests.find(m => m.id === c.capabilityId);
                            const operationSettings = new DataSharingCapabilityOptions$v1(
                                capability.compatible.find(sc => sc.capabilityId === capabilityId)?.options
                            );

                            let operations = [];
                            if (c.capabilityOperations) {
                                operations = operationSettings.externalSharingOperations.map(so => {
                                    return new CriteriaOperation$v1({
                                        capabilityOperationId: so,
                                        enabled: c.capabilityOperations[0].enabled
                                    });
                                });
                            }

                            const update = new SharingCriteria$v1<any, any>({
                                ...c,
                                criteriaType: CriteriaType$v1.externalTenantGlobal,
                                groupId: null,
                                referenceId: Guid.NewGuid(),
                                etag: null,
                                sharingCriteriaId: null,
                                capabilityOperations: operations
                            });

                            this.criteriaStore.upsertCriteria(update);
                        });
                    });
                }
            });
        }
    }

    /**
     * Complete the data sharing wizard
     */
    async finish(): Promise<void> {
        // this.isLoading = false;
        this.criteriaStore.valueChanges$.pipe(first()).subscribe(criteria => {
            this.dialogRef.close(criteria);
        });
    }

    /**
     * Cancels the external sharing wizard
     */
    cancel(): void {
        this.criteriaStore.discardChanges();
        this.tenantStore.discardChanges();
        this.dialogRef.close();
    }
}

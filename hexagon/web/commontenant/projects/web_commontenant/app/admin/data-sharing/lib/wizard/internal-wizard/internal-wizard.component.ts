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
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';

import { CoreService } from '@galileo/web_commontenant/app/_core';
import { DataSharingTenantStoreService } from '../../data-sharing-tenant-store.service';
import { SharingCriteriaStoreService } from '../../sharing-criteria-store.service';
import { IWizardStepComponent } from '../wizard-step/wizard-step.component';
import { WizardService } from '../wizard.service';
import { InternalWizardTranslationTokens } from './internal-wizard.translation';

export enum Steps {
    dataSharingSetupOptions = 'Internal Data Sharing Setup Options',
    dataSharingSetupInfo = 'Internal Data Sharing Setup Info',
    dataSharingClone = 'Data Sharing Clone',
    presetDataTypes = 'Preset Data Types',
    dataSharingPresetsInfo = 'Data Sharing Presets Info',
    dataSharingPresetSetup = 'Data Sharing Preset Setup',
    filteringNetwork = 'Internal Filtering Network',
    applyPresets = 'Apply Presets',
    save = 'Save'
}

export class InternalWizardData {

    /** The step that is being edited */
    editStep?: Steps;

    /** If the filter by groups has already been setup */
    filterByGroups?: boolean;

    /** List of staring sharing criteria */
    sharingCriteria?: SharingCriteria$v1<any, any>[];

    constructor(param: InternalWizardData = {} as InternalWizardData) {
        const {
            editStep = null,
            filterByGroups = null,
            sharingCriteria = []
        } = param;

        this.editStep = editStep;
        this.filterByGroups = filterByGroups;

        if (sharingCriteria?.length) {
            this.sharingCriteria = sharingCriteria.map(sc => new SharingCriteria$v1<any, any>(sc));
        } else {
            this.sharingCriteria = sharingCriteria;
        }
    }
}

@Component({
    templateUrl: 'internal-wizard.component.html',
    styleUrls: ['internal-wizard.component.scss'],
    providers: [
        WizardService,
        SharingCriteriaStoreService
    ]
})
export class InternalWizardComponent implements OnInit, OnDestroy {

    /** The step that is currently active */
    activeStep: Steps = Steps.dataSharingSetupOptions;

    /** Expose Steps to the HTML */
    steps: typeof Steps = Steps;

    /** A flag that is true if filter internally by groups is enable */
    filterByGroups = undefined;

    /** The original value of filter by groups */
    filterByGroupsSource = undefined;

    /** Expose InternalWizardTranslationTokens to HTML */
    tokens: typeof InternalWizardTranslationTokens = InternalWizardTranslationTokens;

    /** The tenant */
    tenant$ = new BehaviorSubject<Tenant$v1>(null);

    /** Id of the current tenant */
    tenantId: string;

    /** A flag that is true if the presets are turned on for groups */
    applyToGroups = false;

    /** A flag that is true if the presets are turned on for the other group */
    applyToOther = false;

    /** List of groups that is currently selected */
    selectedGroupIds$ = this.criteriaStore.valueChanges$.pipe(
        map(list => {
            return [...new Set(list.filter(criteria => {
                return criteria.criteriaType === CriteriaType$v1.internalGroupOverride;
            }).map(criteria => criteria.groupId))];
        })
    );

    /** Expose CriteriaType$v1 to HTML */
    criteriaType: typeof CriteriaType$v1 = CriteriaType$v1;

    /** A flag that is true when loading UI should be shown */
    isLoading = false;

    /** Any step that is being edited */
    editStep: Steps = null;

    /** A flag that is true if the step indicator should be shown */
    showStepIndicator = true;

    /** A flag that is true if external sharing should be cloned */
    cloneEnabled = false;

    /** The last step a user was on */
    previousSteps: Steps[] = [Steps.dataSharingSetupOptions];

    /** List of enabled capabilities */
    enabledCapabilities$ = this.tenant$.pipe(
        map(t => {
            if (t.configuredDataSharingTypes) {
                return t.configuredDataSharingTypes[CriteriaType$v1.internalGroupGlobal];
            } else {
                return [];
            }
        })
    );

    /** A flag that is true if there is any configuration */
    hasConfiguration$ = combineLatest([
        this.criteriaStore.valueChanges$.pipe(
            map(criteria => {
                return !!criteria?.find(c => c.criteriaType === CriteriaType$v1.internalGroupGlobal);
            })
        ),
        this.tenant$.pipe(
            map(tenant => {
                return !!tenant.configuredDataSharingTypes[CriteriaType$v1.internalGroupGlobal]?.length;
            })
        )
    ]).pipe(
        map(([hasCriteria, hasDataTypes]) => {
            return hasCriteria || hasDataTypes;
        })
    );

    /** A flag that is true if there is internal sharing already setup */
    hasExternalSharing = false;

    /**  Observable for component destroyed. Used to clean up subscriptions. */
    private destroy$ = new Subject<boolean>();

    constructor(
        private dialogRef: MatDialogRef<InternalWizardComponent>,
        private wizardSrv: WizardService,
        private tenantStore: DataSharingTenantStoreService,
        private criteriaStore: SharingCriteriaStoreService,
        private coreSrv: CoreService,
        private identityAdapter: CommonidentityAdapterService$v1,
        @Inject(MAT_DIALOG_DATA) settings: InternalWizardData
    ) {

        if (settings?.sharingCriteria?.length) {
            this.criteriaStore.setSource(settings.sharingCriteria);
        }

        if (settings && (settings?.filterByGroups !== null && settings?.filterByGroups !== undefined)) {
            this.setFilterOption(settings.filterByGroups);
            this.filterByGroupsSource = settings.filterByGroups;

            if (!settings.editStep) {
                this.activeStep = Steps.dataSharingSetupInfo;
            }
        }

        if (settings?.editStep) {

            this.editStep = settings.editStep;
            this.activeStep = this.editStep;

            this.showStepIndicator = this.editStep === Steps.dataSharingSetupOptions;
        }
    }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {

        this.tenantStore.valueChanges$.pipe(first()).subscribe(t => {
            this.tenant$.next(new Tenant$v1(t));
        });

        this.criteriaStore.valueChanges$.pipe(first()).subscribe(criteria => {
            this.hasExternalSharing = !!criteria?.find(c => c.criteriaType === CriteriaType$v1.externalTenantGlobal);
        });

        this.identityAdapter.getUserInfoAsync().then(identity => {
            this.tenantId = identity.activeTenant;
        });

        this.wizardSrv.close$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.cancel();
        });

        // Check if the state for filterByGroup should be set
        if (this.filterByGroups === undefined) {
            // Look at groups and tenant
            combineLatest([
                this.selectedGroupIds$,
                this.tenant$
            ]).pipe(first()).subscribe(([ids, tenant]) => {
                if (!tenant.optIntoGroupDataSharing) {
                    this.filterByGroups = null;
                } else if (ids?.length === 1) {
                    // Other users group only
                    this.filterByGroups = false;
                } else if (ids?.length > 1) {
                    this.filterByGroups = true;
                }

                if (this.filterByGroupsSource === undefined) {
                    this.filterByGroupsSource = this.filterByGroups;
                }
            });
        }

        // Check if apply preset to other users should be checked
        if (!!this.editStep) {
            this.criteriaStore.valueChanges$.pipe(
                first()
            ).subscribe((criteria: SharingCriteria$v1<any, any>[]) => {
                const otherUsersGroupId = '00000000-0000-0000-0000-000000000000';

                const otherUsers = criteria.filter(c => c.groupId === otherUsersGroupId);
                if (otherUsers?.length) {
                    // Look to see if anything is enabled
                    otherUsers.forEach((c:  SharingCriteria$v1<any, any>) => {
                        const isOn = !!c.capabilityOperations.find(co => co.enabled);

                        if (isOn) {
                            this.applyToOther = true;
                        }
                    });
                }
            });
        }
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Clones internal data sharing */
    clone(): void {
        if (this.cloneEnabled) {
            this.hasConfiguration$.pipe(first()).subscribe(isSetup => {
                if (!isSetup) {

                    // Clone data types
                    this.tenant$.pipe(first()).subscribe(t => {
                        const update = new Tenant$v1(t);
                        const dataTypes = update.configuredDataSharingTypes[CriteriaType$v1.externalTenantGlobal];
                        update.configuredDataSharingTypes[CriteriaType$v1.internalGroupGlobal] = dataTypes;

                        this.tenant$.next(update);
                    });

                    // Clone sharing criteria
                    this.criteriaStore.valueChanges$.pipe(
                        first(),
                        map(criteria => {
                            return criteria.filter(c => c.criteriaType === CriteriaType$v1.externalTenantGlobal);
                        })
                    ).subscribe(criteria => {
                        criteria.forEach(c => {
                            const manifests = this.coreSrv.getCapabilityList(null, true, true, false);
                            const capability = manifests.find(m => m.id === c.capabilityId);
                            const operationSettings = new DataSharingCapabilityOptions$v1(
                                capability.compatible.find(sc => sc.capabilityId === capabilityId)?.options
                            );

                            let operations = [];
                            if (c.capabilityOperations) {
                                operations = operationSettings.internalSharingOperations.map(so => {
                                    return new CriteriaOperation$v1({
                                        capabilityOperationId: so,
                                        enabled: c.capabilityOperations[0].enabled
                                    });
                                });
                            }

                            const update = new SharingCriteria$v1<any, any>({
                                ...c,
                                criteriaType: CriteriaType$v1.internalGroupGlobal,
                                groupId: c.sharerTenantId,
                                referenceId: Guid.NewGuid(),
                                etag: null,
                                sharingCriteriaId: null,
                                capabilityOperations: operations
                            });

                            this.criteriaStore.upsertCriteria(update);

                            // Clone for other user group
                            const otherUserUpdate = new SharingCriteria$v1<any, any>({
                                ...c,
                                criteriaType: CriteriaType$v1.internalGroupOverride,
                                groupId: '00000000-0000-0000-0000-000000000000',
                                referenceId: Guid.NewGuid(),
                                etag: null,
                                sharingCriteriaId: null,
                                capabilityOperations: operations,
                                currentLevel: null,
                                filterOperations: [],
                                redactionOperations: []
                            });

                            this.criteriaStore.upsertCriteria(otherUserUpdate);
                        });
                    });
                }
            });
        }
    }

    /**
     * Cancels the sharing wizard
     */
    cancel(): void {
        // Discard any changes
        this.criteriaStore.discardChanges();
        this.tenantStore.discardChanges();
        this.dialogRef.close();
    }

    /**
     * Check if the current step is complete. After the current step
     * confirms it is complete the UI navigates to the next step.
     * @param step The step to go to
     * @param ref Reference to the current step
     */
    async setActiveStepAsync(currentStep: Steps, step: Steps, ref: IWizardStepComponent): Promise<void> {
        const isComplete = await ref.completeAsync();
        if (isComplete) {
            this.activeStep = step;
            this.previousSteps = [currentStep, ...this.previousSteps];
        }
    }

    /**
     * Sets the current filter option
     * @param filterByGroup A flag that is true if filter by group is enabled and null if all sharing is enabled
     */
    setFilterOption(filterByGroup: boolean) {
        this.filterByGroups = filterByGroup;

        // Update tenant
        this.tenant$.pipe(
            filter(t => !!t),
            first()
        ).subscribe(tenant => {
            const update = new Tenant$v1(tenant);

            update.optIntoGroupDataSharing = this.filterByGroups !== null;
            this.tenant$.next(update);
        });

    }

    /**
     * Sets the list of enabled capabilities on the tenant object
     * @param ids List of ids of enabled capabilities
     */
    async dataTypesChange(ids: string[]): Promise<void> {
        const tenant = new Tenant$v1(await this.tenant$.pipe(first()).toPromise());

        if (!tenant.configuredDataSharingTypes) {
            tenant.configuredDataSharingTypes = {} as Record<CriteriaType$v1, string[]>;
        }

        tenant.configuredDataSharingTypes[CriteriaType$v1.internalGroupGlobal] = ids;
        this.tenant$.next(tenant);
    }

    /**
     * Sets if the criteria should be enabled or disabled by default for groups and other users
     */
     toggleDataShare(): void {
        const otherUsersGroupId = '00000000-0000-0000-0000-000000000000';
        this.criteriaStore.valueChangeInserts$.pipe(
            first(),
            map(criteria => {
                // Only return overrides
                return criteria.filter(c => c.criteriaType === CriteriaType$v1.internalGroupOverride);
            })
        ).subscribe(criteria => {
            const update = criteria.map(c => new SharingCriteria$v1<any, any>(c));
            // Get the capability manifest
            const manifests = this.coreSrv.getCapabilityList(null, true, true, false);
            update.forEach(sc => {
                const capability = manifests.find(m => m.id === sc.capabilityId);
                const operationSettings = new DataSharingCapabilityOptions$v1(
                    capability.compatible.find(c => c.capabilityId === capabilityId)?.options
                );

                sc.capabilityOperations = operationSettings.internalSharingOperations.map(so => {
                    return new CriteriaOperation$v1({
                        capabilityOperationId: so,
                        enabled: sc.groupId === otherUsersGroupId ? this.applyToOther : this.applyToGroups
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

    /**
     * Complete the data sharing wizard
     */
    async finish(): Promise<void> {
        // Update the store
        this.tenantStore.update(this.tenant$.getValue());

        // Check the filterByGroups flag and remove any groups if needed
        if (!this.filterByGroups && (!this.editStep || this.editStep === Steps.dataSharingSetupOptions)) {
            // Look for groups
            const removeList = await this.criteriaStore.valueChanges$.pipe(
                first(),
                map(list => {
                    const otherUsersGroupId = '00000000-0000-0000-0000-000000000000';

                    return list.filter(sc => {
                        return sc.criteriaType  === CriteriaType$v1.internalGroupOverride &&
                            sc.groupId !== otherUsersGroupId;
                    }).map(sc => sc.referenceId);
                })
            ).toPromise();

            this.criteriaStore.deleteCriteria(removeList);
        }

        // this.isLoading = false;
        this.criteriaStore.valueChanges$.pipe(first()).subscribe(criteria => {
            this.dialogRef.close(criteria);
        });
    }
}

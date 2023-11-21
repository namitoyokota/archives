import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Guid, ListStep } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    capabilityId,
    CapabilityManifest$v1,
    CriteriaOperation$v1,
    CriteriaType$v1,
    DataSharingCapabilityOptions$v1,
    RestrictionLevels$v1,
    SharingCriteria$v1,
} from '@galileo/web_commontenant/_common';
import { CoreService } from '@galileo/web_commontenant/app/_core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { SharingCriteriaStoreService } from '../../../sharing-criteria-store.service';
import { WizardStepComponent } from '../../wizard-step/wizard-step.component';
import {
    DataSharingPresetSetupTranslatedTokens,
    DataSharingPresetSetupTranslationTokens,
} from './data-sharing-preset-setup.translation';

@Component({
    selector: 'hxgn-commontenant-preset-setup',
    templateUrl: 'data-sharing-preset-setup.component.html',
    styleUrls: ['data-sharing-preset-setup.component.scss']
})
export class DataSharingPresetSetupComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** List of capabilities to set data sharing up for */
    @Input('activeCapabilities')
    set setActiveCapabilities(list: string[]) {
        if (list?.length) {
            list.forEach(id => {
                this.layoutCompiler.loadCapabilityCoreAsync(id);
            });

            this.activeCapabilities = list;
        }
    }

    /** List of capabilities to set data sharing up for */
    activeCapabilities: string[] = [];

    /** The type of criteria being created/ edited */
    @Input() criteriaType: CriteriaType$v1;

    /** The type of override criteria to create */
    @Input() overrideType: CriteriaType$v1;

    /** Id of the tenant that is sharing */
    @Input() sharerTenantId: string;

    /** Flag that is true if sharing is for internal */
    @Input() isInternal: boolean = false;

    /** List of capabilities that support data sharing */
    capabilities: CapabilityManifest$v1[] = [];

    /** List of capabilities steps */
    capabilitySteps: ListStep[] = [];

    /** The capability list step that is currently active */
    activeCapabilityStep = 0;

    /** The capability that is currently active */
    private activeCapability = new BehaviorSubject<CapabilityManifest$v1>(null);

    /** The capability that is currently active */
    activeCapability$ = this.activeCapability.asObservable();

    /** The sharing criteria that is being edited */
    activeSharingCriteria$ = combineLatest([
        this.criteriaStore.valueChanges$,
        this.activeCapability$
    ]).pipe(
        map(([criteria, capability]) => {
            if (capability) {
                let sc = criteria.filter(c => {
                    return c.criteriaType === this.criteriaType &&
                        c.capabilityId === capability.id;
                });

                if (!sc?.length) {
                    const operationSettings = new DataSharingCapabilityOptions$v1(
                        capability.compatible.find(c => c.capabilityId === capabilityId)?.options
                    );

                    let capabilityOperations: CriteriaOperation$v1[];
                    if (this.criteriaType === CriteriaType$v1.internalGroupGlobal ||
                        this.criteriaType === CriteriaType$v1.internalGroupOverride) {
                        capabilityOperations = operationSettings.internalSharingOperations.map(so => {
                            return new CriteriaOperation$v1({
                                capabilityOperationId: so,
                                enabled: true
                            });
                        });
                    } else {
                        capabilityOperations = operationSettings.externalSharingOperations.map(so => {
                            return new CriteriaOperation$v1({
                                capabilityOperationId: so,
                                enabled: true
                            });
                        });
                    }

                    const newCriteria = new SharingCriteria$v1<any, any>({
                        currentLevel: RestrictionLevels$v1.low,
                        criteriaType: this.criteriaType,
                        referenceId: Guid.NewGuid(),
                        shareeTenantId: this.sharerTenantId,
                        sharerTenantId: this.sharerTenantId,
                        groupId: this.criteriaType === CriteriaType$v1.internalGroupGlobal ? this.sharerTenantId : null,
                        capabilityId: capability.id,
                        capabilityOperations: capabilityOperations
                    } as SharingCriteria$v1<any, any>);

                    if (this.criteriaType === CriteriaType$v1.externalTenantGlobal) {
                        this.createExternalOverrides(newCriteria);
                    } else if (this.criteriaType === CriteriaType$v1.internalGroupGlobal) {
                        this.createInternalOverrides(newCriteria);
                    }

                    sc = [newCriteria];
                }

                return sc[0];
            }
        })
    );

    /** Expose DataSharingPresetSetupTranslationTokens to HTML */
    tokens: typeof DataSharingPresetSetupTranslationTokens = DataSharingPresetSetupTranslationTokens;

    /** Translated tokens */
    tTokens: DataSharingPresetSetupTranslatedTokens = {} as DataSharingPresetSetupTranslatedTokens;

    /** Map for translated capability tokens. */
    capabilityTokens: Map<string, string> = new Map<string, string>();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private coreSrv: CoreService,
        private criteriaStore: SharingCriteriaStoreService,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private layoutCompiler: LayoutCompilerAdapterService
    ) {
        super();
    }

    /**
     * On init life cycle hook
     */
    async ngOnInit() {
        this.setIsDirty(true);
        this.initLocalizationAsync();

        this.capabilities = this.coreSrv.getCapabilityList(null, true, this.isInternal, !this.isInternal).filter(c => {
            return this.activeCapabilities.includes(c.id);
        });

        await this.loadCapabilityTokens();

        if (this.capabilities.length) {
            // Setup steps
            this.capabilitySteps = this.capabilities.map(c => {
                return new ListStep(c.nameToken, false, this.criteriaStore.exists(c.id, this.criteriaType));
            });

            const selectedIndex = this.capabilitySteps.findIndex(step => !step.complete);
            this.setCapabilityByIndex(selectedIndex !== -1 ? selectedIndex : 0);
        }

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
            this.loadCapabilityTokens();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Loads translations then sorts capability list */
    private async loadCapabilityTokens() {
        const capabilityNameTokens: string[] = this.capabilities.map(x => x.nameToken);
        await this.localizationAdapter.localizeStringsAsync(capabilityNameTokens);

        const translatedTokens = await this.localizationAdapter.getTranslationAsync(capabilityNameTokens);
        capabilityNameTokens.forEach((token: string) => {
            this.capabilityTokens.set(token, translatedTokens[token]);
        });

        this.capabilities.sort((a, b) => translatedTokens[a.nameToken] > translatedTokens[b.nameToken] ? 1 : -1);
    }

    /**
     * Called when the user tries to go to the next step.
     * Returns true if the wizard can go to the next step.
     * @returns Returns true if the step is completed
     */
    completeAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            // Check if all capability steps are done.
            const nextStep = this.capabilitySteps.findIndex(step => !step.complete);

            if (nextStep !== -1) {
                this.setCapabilityByIndex(nextStep);

                resolve(false);
            } else {
                resolve(true);
            }
        });
    }

    /**
     * Sets the active capability by a given index
     * @param index Index of the active capability
     */
    setCapabilityByIndex(index: number): void {
        this.activeCapabilityStep = index;
        this.activeCapability.next(this.capabilities[index]);
        this.capabilitySteps[index].complete = true;
    }

    /**
     * Sets the sharing criteria when it changes
     * @param sharingCriteria The sharing criteria that has been created or updated
     */
    setCriteria(sharingCriteria: SharingCriteria$v1<any, any>): void {
        this.criteriaStore.upsertCriteria(sharingCriteria);
    }

    /**
     * Creates an external override based on the given criteria document
     * @param newCriteria Criteria to base the override on
     */
    private createExternalOverrides(newCriteria: SharingCriteria$v1<any, any>) {
        // Create overrides for any tenants that already have overrides
        this.criteriaStore.valueChanges$.pipe(
            first(),
            map(scList => scList.filter(c => c.criteriaType === this.overrideType)),
            map(scList => [...new Set(scList.map(list => list.shareeTenantId))])
        ).subscribe(tenantIds => {
            let newCriteriaList = [newCriteria];

            if (tenantIds) {
                // Create override documents
                newCriteriaList = newCriteriaList.concat(tenantIds.map(id => {
                    return new SharingCriteria$v1({
                        ...newCriteria,
                        referenceId: Guid.NewGuid(),
                        filterOperations: [],
                        redactionOperations: [],
                        shareeTenantId: id,
                        criteriaType: CriteriaType$v1.externalTenantOverride,
                        currentLevel: null,
                        capabilityOperations: newCriteria.capabilityOperations.map(co => {
                            return new CriteriaOperation$v1({
                                capabilityOperationId: co.capabilityOperationId,
                                enabled: false
                            } as CriteriaOperation$v1);
                        })
                    });
                }));
            }

            this.criteriaStore.upsertCriteria(newCriteriaList);
        });
    }

    /**
     * Creates an internal override based on the given criteria document
     * @param newCriteria Criteria to base the override on
     */
    private createInternalOverrides(newCriteria: SharingCriteria$v1<any, any>) {
        // Create overrides for any tenants that already have overrides
        this.criteriaStore.valueChanges$.pipe(
            first(),
            map(scList => scList.filter(c => c.criteriaType === this.overrideType)),
            map(scList => {
                // Check for other user group
                const otherUsersGroupId = '00000000-0000-0000-0000-000000000000';
                const otherGroupExists = !!scList.find(sc => sc.groupId === otherUsersGroupId);

                let groupIds = [...new Set(scList.map(list => list.groupId))];
                if (!otherGroupExists) {
                    groupIds = groupIds.concat(otherUsersGroupId);
                }

                return groupIds;
            }),
        ).subscribe(groupIds => {
            let newCriteriaList = [newCriteria];

            if (groupIds) {
                // Create override documents
                newCriteriaList = newCriteriaList.concat(groupIds.map(id => {
                    return new SharingCriteria$v1({
                        ...newCriteria,
                        referenceId: Guid.NewGuid(),
                        filterOperations: [],
                        redactionOperations: [],
                        groupId: id,
                        criteriaType: CriteriaType$v1.internalGroupOverride,
                        currentLevel: null,
                        capabilityOperations: newCriteria.capabilityOperations.map(co => {
                            return new CriteriaOperation$v1({
                                capabilityOperationId: co.capabilityOperationId,
                                enabled: false
                            } as CriteriaOperation$v1);
                        })
                    });
                }));
            }

            this.criteriaStore.upsertCriteria(newCriteriaList);
        });
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(DataSharingPresetSetupTranslationTokens).map(k => DataSharingPresetSetupTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.dataSharingPresetsAlt = translatedTokens[DataSharingPresetSetupTranslationTokens.dataSharingPresets];
        this.tTokens.infoButtonMessage = translatedTokens[DataSharingPresetSetupTranslationTokens.infoButtonMessage];
    }
}

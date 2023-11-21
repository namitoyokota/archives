import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CriteriaOperation$v1, CriteriaType$v1, SharingCriteria$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { SharingCriteriaStoreService } from '../../../../sharing-criteria-store.service';
import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import {
    ExternalSharingNetworkTranslatedTokens,
    ExternalSharingNetworkTranslationTokens,
} from './external-sharing-network.translation';

@Component({
    selector: 'hxgn-commontenant-external-sharing-network',
    templateUrl: 'external-sharing-network.component.html',
    styleUrls: ['external-sharing-network.component.scss']
})
export class ExternalSharingNetworkComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** List of tenants that are selected to do external data sharing for */
    @Input() selectedTenants: string[];

    /** Expose ExternalSharingNetworkTranslationTokens to HTML */
    tokens: typeof ExternalSharingNetworkTranslationTokens = ExternalSharingNetworkTranslationTokens;

    /** Translated tokens */
    tTokens: ExternalSharingNetworkTranslatedTokens = {} as ExternalSharingNetworkTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private criteriaStore: SharingCriteriaStoreService,
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        super();
    }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.initLocalizationAsync();

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Called when the user tries to go to the next step.
     * Returns true if the wizard can go to the next step.
     * @returns Returns true if the step is completed
     */
    completeAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            resolve(true);
        });
    }

    /**
     * Updates the sharing criteria for selected tenants
     * @param tenants Ids of the currently selected tenants
     */
    async updateCriteria(tenants: string[]) {
        const globalCriteria = await this.criteriaStore.valueChanges$.pipe(
            first(),
            map(list => list.filter(sc => sc.criteriaType === CriteriaType$v1.externalTenantGlobal))
        ).toPromise();

        const overrideCriteria = await this.criteriaStore.valueChanges$.pipe(
            first(),
            map(list => list.filter(sc => sc.criteriaType === CriteriaType$v1.externalTenantOverride))
        ).toPromise();

        // Create any missing criteria
        tenants?.forEach((id: string) => {
            // If tenant is not found in override list create it
            const isFound = !!overrideCriteria.find(c => c.shareeTenantId === id);
            if (!isFound) {

                // Create overrides from globals
                const overrides = globalCriteria.map(gc => {
                    return new SharingCriteria$v1({
                        ...gc,
                        referenceId: Guid.NewGuid(),
                        filterOperations: [],
                        redactionOperations: [],
                        shareeTenantId: id,
                        criteriaType: CriteriaType$v1.externalTenantOverride,
                        currentLevel: null,
                        capabilityOperations: gc.capabilityOperations.map(co => {
                            return new CriteriaOperation$v1({
                                capabilityOperationId: co.capabilityOperationId,
                                enabled: false
                            } as CriteriaOperation$v1);
                        }),
                        sharingCriteriaId: null
                    });
                });

                this.criteriaStore.upsertCriteria(overrides);
            }
        });

        // Delete any removed criteria
        const removeList = overrideCriteria.filter(oc => {
            // If oc is not in the tenant list then it needs to be deleted
            return !tenants.find(id => id === oc.shareeTenantId);
        }).map(oc => oc.referenceId);

        if (removeList?.length) {
            this.criteriaStore.deleteCriteria(removeList);
        }
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(ExternalSharingNetworkTranslationTokens).map(k => ExternalSharingNetworkTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        const keys = Object.keys(ExternalSharingNetworkTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[ExternalSharingNetworkTranslationTokens[prop]];
        }
    }
}

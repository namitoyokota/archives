import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CriteriaOperation$v1, CriteriaType$v1, SharingCriteria$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { SharingCriteriaStoreService } from '../../../../sharing-criteria-store.service';
import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import {
    InternalFilteringNetworkTranslatedTokens,
    InternalFilteringNetworkTranslationTokens,
} from './internal-filtering-network.translation';

@Component({
    selector: 'hxgn-commontenant-internal-filtering-network',
    templateUrl: 'internal-filtering-network.component.html',
    styleUrls: ['internal-filtering-network.component.scss']
})
export class InternalFilteringNetworkComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** List of groups that are selected to do internal data sharing */
    @Input() selectedGroups: string[];

    /** Expose InternalFilteringNetworkTranslationTokens to HTML */
    tokens: typeof InternalFilteringNetworkTranslationTokens = InternalFilteringNetworkTranslationTokens;

    /** Translated tokens */
    tTokens: InternalFilteringNetworkTranslatedTokens = {} as InternalFilteringNetworkTranslatedTokens;

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
        this.setIsDirty(true);

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
     * Updates the sharing criteria for selected groups
     * @param groupIds Ids of the currently selected groups
     */
    async updateCriteria(groupIds: string[]): Promise<void> {

        if (!groupIds || !Array.isArray(groupIds)) {
            return;
        }

        const globalCriteria = await this.criteriaStore.valueChanges$.pipe(
            first(),
            map(list => list.filter(sc => sc.criteriaType === CriteriaType$v1.internalGroupGlobal))
        ).toPromise();

        const overrideCriteria = await this.criteriaStore.valueChanges$.pipe(
            first(),
            map(list => list.filter(sc => sc.criteriaType === CriteriaType$v1.internalGroupOverride))
        ).toPromise();

        // Create any missing criteria
        groupIds?.forEach((id: string) => {
            // If tenant is not found in override list create it
            const isFound = !!overrideCriteria.find(c => c.groupId === id);
            if (!isFound) {

                // Create overrides from globals
                const overrides = globalCriteria.map(gc => {
                    return new SharingCriteria$v1({
                        ...gc,
                        referenceId: Guid.NewGuid(),
                        filterOperations: [],
                        redactionOperations: [],
                        groupId: id,
                        criteriaType: CriteriaType$v1.internalGroupOverride,
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
            return !groupIds.find(id => id === oc.groupId);
        }).map(oc => oc.referenceId);

        if (removeList?.length) {
            this.criteriaStore.deleteCriteria(removeList);
        }
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(InternalFilteringNetworkTranslationTokens)
            .map(k => InternalFilteringNetworkTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        const keys = Object.keys(InternalFilteringNetworkTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[InternalFilteringNetworkTranslationTokens[prop]];
        }
    }
}

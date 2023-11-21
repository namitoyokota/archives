import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { KeywordRuleset$v1, ResourceType$v1, RulesetRequest$v1 } from '@galileo/web_commonkeywords/_common';
import { CapabilityManifest$v1, Industries$v1, Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { DataService } from '../../data.service';
import { OnboardingTranslationTokens } from '../onboarding-injectable.translation';

interface ApplyAll {

    /** Whether or not apply all is selected for this capability. */
    checked: boolean;

    /** The selected ruleset name to apply to all industries. */
    rulesetName: string;
}

@Component({
    selector: 'hxgn-commonkeywords-rule-set-selection',
    templateUrl: 'rule-set-selection.component.html',
    styleUrls: ['rule-set-selection.component.scss']
})
export class RuleSetSelectionComponent implements OnInit, OnDestroy {

    /** Capability to filter the selection list */
    @Input() capability$: Observable<CapabilityManifest$v1>;

    /** List of all industries */
    @Input() industryList: Industries$v1[] = [];

    /** The current tenant */
    @Input() tenant: Tenant$v1;

    /** Dictionary for ruleset requests to capability */
    @Input() selectedRuleSets = new Map<string, RulesetRequest$v1[]>();

    /** Event out when the selected ruleset changes */
    @Output() selectedRuleSetsChange = new EventEmitter<Map<string, RulesetRequest$v1[]>>();

    /** Tracks which capabilities have applies rules to all industries. */
    capabilityApplyAllMap: Map<string, ApplyAll> = new Map<string, ApplyAll>();

    /** List of rulesets options for selection list */
    ruleSets: KeywordRuleset$v1[] = [];

    /** Tracks currently selected capability. */
    selectedCapability: CapabilityManifest$v1 = null;

    /** Expose translation tokens to html. */
    tokens: typeof OnboardingTranslationTokens = OnboardingTranslationTokens;

    /** Event when the component is destroyed */
    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        private dataSrv: DataService
    ) { }

    /**
     * On init life cycle event
     */
    async ngOnInit(): Promise<void> {

        // Set up listener for selected capability changes
        this.capability$.pipe(filter(data => !!data), takeUntil(this.destroy$)).subscribe(async capability => {
            this.selectedCapability = capability;

            // If this is a new capability, add the default Apply All rules to the map
            if (!this.capabilityApplyAllMap.has(this.selectedCapability.id)) {
                const applyAll = {
                    checked: true,
                    rulesetName: null
                } as ApplyAll;

                this.capabilityApplyAllMap.set(this.selectedCapability.id, applyAll);
            }

            this.ruleSets = [].concat(
                await this.dataSrv.ruleset.getSystemDefined$(ResourceType$v1.Icon, this.selectedCapability.id).toPromise()
            );
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Returns an industry by id
     * @param id Industry id
     */
    getIndustry(id: string): Industries$v1 {
        return this.industryList.find(industry => industry.id === id);
    }

    /**
     * Gets selected ruleset name by industry to populate dropdowns
     * @param id Industry id
     */
    getSelectedRulesetName(id: string): string {
        let selectedRulesetName: string = null;
        const selectedCapabilityRulesets: RulesetRequest$v1[] = this.selectedRuleSets.get(this.selectedCapability.id);
        if (selectedCapabilityRulesets?.length) {
            const industryRuleset = selectedCapabilityRulesets.find(x => x.industryId === id);
            if (industryRuleset) {
                selectedRulesetName = industryRuleset.rulesetName;
            }
        }

        return selectedRulesetName;
    }

    /**
     * Runs whenever a new selection is made in a dropdown
     * @param ruleSet Selected ruleset
     * @param id Industry ID
     */
    selectionChanged(ruleSet: KeywordRuleset$v1, id: string): void {

        // Create default ruleset request
        const rulesetRequest = new RulesetRequest$v1({
            industryId: id,
            resourceType: ResourceType$v1.Icon,
            rulesetName: ruleSet.name
        });

        let selectedCapabilityRulesets: RulesetRequest$v1[] = this.selectedRuleSets.get(this.selectedCapability.id);
        if (selectedCapabilityRulesets?.length) { // If this capability has existing default rulesets then continue
            const existingIndex = selectedCapabilityRulesets.findIndex(x => x.industryId === id);
            if (existingIndex !== -1) { // If there is an existing ruleset defined then update that ruleset
                selectedCapabilityRulesets[existingIndex].rulesetName = ruleSet.name;
            } else { // Otherwise, add the default request to the existing array
                selectedCapabilityRulesets.push(rulesetRequest);
            }
        } else { // Otherwise, create a new array and add the default request
            selectedCapabilityRulesets = [];
            selectedCapabilityRulesets.push(rulesetRequest);
        }

        this.selectedRuleSets.set(this.selectedCapability.id, selectedCapabilityRulesets);
        this.selectedRuleSetsChange.emit(this.selectedRuleSets);
    }

    /**
     * Runs whenever a selection is made in the apply all dropdown
     * @param ruleSet Selected ruleset
     */
    selectionChangedApplyAll(ruleSet: KeywordRuleset$v1): void {

        // Create array of new rulesets
        const newRulesets: RulesetRequest$v1[] = [];
        this.tenant.industryIds.forEach((industryId: string) => {
            const rulesetRequest = new RulesetRequest$v1({
                industryId: industryId,
                resourceType: ResourceType$v1.Icon,
                rulesetName: ruleSet.name
            });

            newRulesets.push(rulesetRequest);
        });

        // Overwrite any existing rulesets by setting new apply all rulesets
        this.selectedRuleSets.set(this.selectedCapability.id, newRulesets);
        this.selectedRuleSetsChange.emit(this.selectedRuleSets);

        // Update ruleset name in apply all map
        const applyAll: ApplyAll = this.capabilityApplyAllMap.get(this.selectedCapability.id);
        applyAll.rulesetName = ruleSet.name;
        this.capabilityApplyAllMap.set(this.selectedCapability.id, applyAll);
    }

    /**
     * Updates apply all map values whenever the checkbox value is changed
     * @param $event MatCheckbox event
     */
    setCapabilityApplyAll($event: MatCheckboxChange): void {
        const applyAll: ApplyAll = this.capabilityApplyAllMap.get(this.selectedCapability.id);
        applyAll.checked = $event.checked;

        if (!$event.checked) {
            applyAll.rulesetName = null;
        }

        this.capabilityApplyAllMap.set(this.selectedCapability.id, applyAll);
    }
}
